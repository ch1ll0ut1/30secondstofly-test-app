"use strict";

/**
 * Request utility helper
 *
 * todo: add gzip support
 * todo: handle connection timeout
 *
 * Note: this file is meant to be specific for current needs and will mutate and grow with adding cases of need, 
 * to become semilar as the npm request package but only a subset to gain higher performance
 */

var https = require("https");
// var zlib = require('zlib');

/**
 * @param  {Object} data to be sent as json through a https post method
 * @param  {String} hostname
 * @param  {String} path
 * @param  {Function} callback to receive the response (err, data)
 * @return {undefined} undefined
 */
exports.postJson = function postJson(data, hostname, path, callback)
{
	var data = JSON.stringify(data);

	var request_options = {
	    method: "POST",
	    hostname: hostname,
	    path: path,
	    headers: {
	        "Content-Type": "application/json",
	        "Content-Length": data.length,
	        // "accept-encoding": "gzip"
	    }
	};

	//create post request
	var request = https.request(request_options, function(response){

	    // console.log('response to: ' + request_options.hostname + request_options.path);
	    // console.log('response status: ' + response.statusCode);
	    console.log('response headers: ' + JSON.stringify(response.headers));

	    var data = "";

	    response.setEncoding("utf8");

	    response.on("data", function(chunk) {
	    	// console.log("response chunk", chunk)
	        data += chunk;
	    });

		response.on("end", function() {

			if(!data)
			{
				return callback(null, {});
			}

			// var gzip = zlib.createGzip();

			//parse response to json
			try
			{
				data = JSON.parse(data);	
			}
			catch(err)
			{
				return callback(new Error("Failed parsing response as json: "+err));
			}

			callback(null, data);
		});

	});

	request.on("error", function() {
	    console.log("request error: ", arguments);
	});

	//send post data
	request.write(data);

	//close request
	request.end();
}