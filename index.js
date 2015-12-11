"use strict";
/**
todo:
- provide rest api
- todo: implement prefered carrier 
**/

/**
 * todo: validate and filter parameters
 */

var chooseFlight = require("./app/choose_flight");
var db = require("./app/db");

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

chooseFlight(options, function(err, answer){
    console.log(answer);

    db.close();
});

