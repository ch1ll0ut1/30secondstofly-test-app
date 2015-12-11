"use strict";

/**
	Implementation of googles Qpx simple rest Api using api_key as authentication.

	todo: cache should not be active in production mode
**/

var extend = require("../extend");
var request = require("../request");
var jsonfile = require("jsonfile")

//retrieve qpx api config
var config = require("../../config");

if(!config.api || !config.api.qpx || !config.api.qpx.key || !config.api.qpx.host || !config.api.qpx.path)
{
	throw new Error("Missing api configuration for Google APX Api");
}

config = config.api.qpx;

//encode api key for url usage
config.key = encodeURIComponent(config.key);

//define default options for search requests
var default_options = {
	limit: 5,
	adult_passengers: 0,
	child_passengers: 0,
	origin: "",
	destination: "",
	date: undefined,
	time: undefined,
	flight_class: "economy",  //ecnomy | business | first
	max_stops: undefined,
	permitted_carrier: undefined
}

/**
 * Searches for available flights and calculates the mean average of flight duration
 * @param  {Object}   options  same options as searchFlights()
 * @param  {Function} callback [description]
 * @return {undefined}         [description]
 */
exports.getAverageFlightDuration = function getAverageFlightDuration(options, callback)
{
	//set higher limit to get an better average
	if(!options.limit || options.limit < 5) options.limit = 5;

	var data = createRequestData(options);

	var host = config.host;
	var path = config.path + "?key=" + config.key;

	//add response fields filter
	path += "&fields=";
	path += encodeURIComponent("trips/tripOption(slice(duration))");

	//create cache file name
	var cache_file = createCacheFilename("duration", host, options);

	//read cache file
	var cache = readCacheFile(cache_file);
	
	//use cached version if exists
	if(cache)
	{
		callback(null, calculateAverageFlightDuration(cache));
	}
	//else send request
	else
	{
		request.postJson(data, host, path, function(err, data){

			//handle errors returned by qpx api
			if(data && data.error)
			{
				callback(new Error(data.error.message));
			}
			else
			{
				writeCacheFile(cache_file, data);

				callback(null, calculateAverageFlightDuration(data));
			}
		});
	}

}

/**
 * Searches possible flights for given parameter
 * @param  {Object}   options  [description]
 * @param  {Function} callback [description]
 * @return {Undefined}         [description]
 */
exports.searchFlights = function searchFlights(options, callback)
{
	var data = createRequestData(options);

	var host = config.host;
	var path = config.path + "?key=" + config.key;

	//add response fields filter
	path += "&fields="
	path += encodeURIComponent("trips/tripOption(saleTotal, pricing(latestTicketingTime), slice(duration, segment(leg(aircraft, arrivalTime, departureTime, origin, destination, mileage))))");

	//create cache file name
	var cache_file = createCacheFilename("search", host, options);

	//read cache file
	var cache = readCacheFile(cache_file);

	//check if cache exists, if not run request
	if(cache)
	{
		callback(null, cache);
	}
	else
	{
		request.postJson(data, host, path, function(err, data){

			//handle errors returned by qpx api
			if(data && data.error)
			{
				callback(new Error(data.error.message));
			}
			else
			{
				writeCacheFile(cache_file, data);

				callback(null, data);
			}
		});
	}
}

function calculateAverageFlightDuration(data)
{
	if(!data.trips || !data.trips.tripOption) return 0;

	var options = data.trips.tripOption;
	var sum = 0;

	for(var i = 0; i < options.length; i++)
	{
		var slices = options[i].slice;

		for(var n = 0; n < slices.length; n++)
		{
			sum += slices[n].duration;
		}
	}

	return parseInt(sum / options.length);
}

function readCacheFile(filename)
{
	try 
	{
		// note: using sync here because this cache is definetly not inteded for production!
		return jsonfile.readFileSync(filename);	
	}
	catch(err)
	{
		return null;
	}
}

function writeCacheFile(filename, data)
{
	jsonfile.writeFile(filename, data, {spaces: 4}, function(err) {
	  	if(err) console.error(err)
	});
}

function createCacheFilename(prefix, host, options)
{
	var cache_file = prefix + host + JSON.stringify(options);
	return "./api_request_cache/" + cache_file.replace(/[^a-z0-9]/gi, '_').toLowerCase() + ".json";
}

function createRequestData(options)
{
	//add default options to the options parameter
	options = extend(default_options, options || {});

	var data = {
	    "request": {
	    	"solutions": options.limit,
	        "passengers": {
	            "adultCount": options.adult_passengers,
	            "childCount": options.child_passengers
	        },
	        "slice": [{
	            "origin": options.origin,
	            "destination": options.destination,
	            "date": options.date,
	            "maxStops": options.max_stops,
	            "permittedDepartureTime": {
	            	"latestTime": options.time || null
	            }
	        }]
	    }
	};

	return data;
}