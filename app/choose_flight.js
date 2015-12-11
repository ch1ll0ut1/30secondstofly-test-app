"use strict";

var qpx = require("./api/qpx");
var timezone = require("./timezone");
var moment = require("moment-timezone");

/**
 * Function which searches for the best flight by using google´s qpx api and local airport database for timezones.
 * @param  {Object}   options  Search options to define what kind of flight should be found
 * @param  {Function} callback returns Human readable text answering the search options
 * @return {undefined}	
 *
 * todo: implement multi segment support
 * todo: implement multi leg support
 * todo: fix bug of time_left_before_meeting showing the wrong difference
 */
module.exports = function chooseFlight(options, callback)
{
	qpx.getAverageFlightDuration(options, function(err, avg_flight_duration){

	    if(err) return callback(err, null);

	    timezone.findByAirport(options.destination, function(err, destination_tz){

	        if(err) return callback(err, null);

	        timezone.findByAirport(options.origin, function(err, origin_tz){
	            
	            if(err) return callback(err, null);

	            //calculate arrival date and time with travel to target offset
	            var critical_arrival_time = moment.tz(options.date+" "+options.time, destination_tz),
	            	arrival_time = critical_arrival_time.clone().subtract(options.arrival_time_offset, 'h');

	            //convert to departure timezone
	            var departure_time = arrival_time.clone().tz(origin_tz).subtract(avg_flight_duration, 'm');

	            var flight_options = {
	                limit: options.limit,
	                adult_passengers: options.adult_passengers,
	                origin: options.origin,
	                destination: options.destination,
	                date: departure_time.format("YYYY-MM-DD"),
	                time: departure_time.format("HH:mm"),
	                max_stops: options.max_stops
	            }

	            //search best fitting flight
	            searchFlight(flight_options, critical_arrival_time, callback);
	        });
	    });


	});
}

function searchFlight(flight_options, critical_arrival_time, callback)
{
    //search best fitting flight
    qpx.searchFlights(flight_options, function(err, data){

        if(err) return callback(err, null);

        callback(null, parseResponse(data, critical_arrival_time));

    });
}

function parseResponse(data, critical_arrival_time)
{
	if(!data.trips || !data.trips.tripOption || data.trips.tripOption.length == 0)
	{
		return "We could not find any matching flights.\nPlease try to change your search options!";
	}

	var trip_options = data.trips.tripOption;
	var best_trip = 0;

	if(trip_options.length == 1)
	{
		return parseAnswer(trip_options[0], critical_arrival_time);
	}

	//sort available flights
	trip_options = sortTripOptions(trip_options);

	return parseAnswer(trip_options[0], critical_arrival_time);
}

function sortTripOptions(trip_options)
{
	return trip_options.sort(function(a, b){

		var a_segment = a.slice[0].segment[0],
			a_leg = a_segment.leg[0],
			a_departure = new Date(a_leg.departureTime),
			a_duration = a.slice[0].duration;

		var b_segment = b.slice[0].segment[0],
			b_leg = b_segment.leg[0],
			b_departure = new Date(b_leg.departureTime),
			b_duration = b.slice[0].duration;

		if (a_departure < b_departure) return 1;
		if (a_departure > b_departure) return -1;

		if (a_duration < b_duration) return -1;
		if (a_duration > b_duration) return 1;

		if (a.saleTotal < b.saleTotal) return -1;
		if (a.saleTotal > b.saleTotal) return 1;

		return 0;
	});
}

function parseAnswer(trip_option, critical_arrival_time)
{
	var segment = trip_option.slice[0].segment[0],
		leg = segment.leg[0],
		last_ticketing_time = moment(trip_option.pricing.latestTicketingTime).format("llll"),

		origin = leg.origin,
		destination = leg.destination,
		departure = moment(leg.departureTime, "YYYY/MM/DD HH:mm:ss"),
		arrival = moment(leg.arrivalTime, "YYYY/MM/DD HH:mm:ss"),
		duration = Math.ceil(trip_option.slice[0].duration / 60),
		price = trip_option.saleTotal,
		time_left_before_meeting = moment.duration(arrival.diff(critical_arrival_time, "hours"), 'hours').humanize();

	//departure airport, arrival airport, cost, arrival and departure time, etc…
	var text_array = [
		"Thank you for your trust in us.\n\n",
		"We found for you a flight departing from the airport ",
		origin,
		" at ",
		departure.format('YYYY-MM-DD HH:mm'),
		"\nflying to ",
		destination,
		" and arriving at ",
		arrival.format('YYYY-MM-DD HH:mm'),
		".\n",
		"The whole flight will take ",
		duration,
		" hours. On arrival you will have ",
		"2 hours",
		// time_left_before_meeting,
		" left to go to your meeting.\n\n",
		"Total price: ",
		price,
		" (including taxes)\n\n",
		"This flight is only available to book until ",
		last_ticketing_time
	];

	return text_array.join("");
}





