"use strict";

/**
 * Request utility helper
 *
 * todo: handle connection timeout
 *
 * Note: this file is meant to be specific for current needs and will mutate and grow with adding cases of need, 
 * to become semilar as the npm request package but only a subset to gain higher performance
 */

var https = require("https");
var zlib = require('zlib');

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
	        "accept-encoding": "gzip,deflate"
	    }
	};

	//create post request
	var request = https.request(request_options, function(response){

	    var stream = response;

	    switch(response.headers["content-encoding"])
	    {
	    	case 'gzip':
	    	case 'deflate':
		    	stream = zlib.createUnzip();
		    	response.pipe(stream);
	    	break;
	    }

	    var data = "";

	    stream.setEncoding("utf8");

	    stream.on("data", function(chunk) {
	        data += chunk;
	    });

		stream.on("end", function() {

			if(!data)
			{
				return callback(null, {});
			}

			//parse streamed data to json
			try
			{
				data = JSON.parse(data);	
			}
			catch(err)
			{
				return callback(new Error("Failed parsing stream as json: "+err));
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