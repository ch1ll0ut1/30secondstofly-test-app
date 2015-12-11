"use strict";

/**
 * Singleton mysql connection wrapper which creates a connection with the first module load
 *
 * todo: create global app event bus for handling gracefully shutdown through several server services (db, wss, http..)
 */

var mysql = require("mysql");
var config = require("../config");

var db = module.exports = {
	init: function init(options){

		var options = {
			database: options.database || "",
			user: options.user || "",
			password: options.password || "",
			host: options.host || "localhost",
			port: options.port || 3306
		};

		db.connection = mysql.createConnection(options);

		db.connection.connect(function(err){
			
			if(err)
			{
				throw new Error('Error connecting to mysql db '+options.user+"@"+options.host+":"+options.port+" => "+err);
			}

			// console.info('Mysql connection established!');
		});

		process.once('uncaughtException', this.close);
		process.once('SIGINT', this.close);
	},
	close: function(exception){

		//gracefully shutting down db connection
		db.connection.end(function(err){

			if(err)
			{
				console.error("db error", err);
			}

			if(exception)
			{
				//re throw exception
				throw exception;
			}
			else
			{
				// console.info("\n\ngracefully shutting down app..");
				process.exit();
			}
		});
	},
	query: function(sql, callback){
		this.connection.query(sql, function(err, rows){
			if(callback)
			{
				callback(err, rows);
			}
			else
			{
				throw err;
			}
		});
	},
	escape: function(value){
		return mysql.escape(value);
	}

}

//start database 
if(!config.db)
{
	throw new Error("Missing database configuration");
}

db.init(config.db);