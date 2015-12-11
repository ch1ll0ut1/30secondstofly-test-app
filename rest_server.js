var http = require('http');
var chooseFlight = require("./app/choose_flight");
var db = require("./app/db");
var url = require('url');
var extend = require("./app/extend");

http.createServer(handleRequest).listen(1337, "127.0.0.1");

console.log('Server running at http://127.0.0.1:1337/');

function handleRequest(request, response){
    response.writeHead(200, {
        'Content-Type': 'text/plain'
    });

    switch(request.method)
    {
    	// case "POST": return handlePostRequest(request, response);
    	case "GET": return handleGetRequest(request, response);
    }
}

function handleGetRequest(request, response){

	var query = url.parse(request.url, true).query

	var options = {
	    limit: 20,
	    adult_passengers: 1,
	    origin: "JFK",
	    destination: "LAX",
	    date: "2016-01-12",
	    time: "14:00",
	    flight_class: "economy",
	    max_stops: 0,
	    arrival_time_offset: 1.5 //time to get from airport to the office
	}

	//lets keep it simple for now..
	options = extend(options, query);

	chooseFlight(options, function(err, answer){
	    response.write(answer, 'utf8');

	    response.end();
	});

}

// function handlePostRequest(request, response){

// 	var options = {
// 	    limit: 20,
// 	    adult_passengers: 1,
// 	    origin: "JFK",
// 	    destination: "LAX",
// 	    date: "2016-01-12",
// 	    time: "14:00",
// 	    flight_class: "economy",
// 	    max_stops: 0,
// 	    arrival_time_offset: 1.5 //time to get from airport to the office
// 	}

// 	chooseFlight(options, function(err, answer){
// 	    response.write(answer, 'utf8');

// 	    response.end();
// 	});

// }

