"use strict";

/**
 * Timezone Model using the database table "airport" for retrieving airport related timezones
 */

var db = require("./db");

function findByAirport(airport, callback)
{
	//escape values
	airport = db.escape(airport);

	//build sql
	var sql = "SELECT `tz` FROM `airport` where `iata_faa` = "+airport+" or `icao` = "+airport;

	//execute sql
	db.query(sql, function(err, rows){

		if(!err && rows.length > 0)
		{
			return callback(null, rows[0].tz);
		}

		callback(err, null);
	});
}

module.exports.findByAirport = findByAirport;