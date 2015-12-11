# 30secondstofly-test-app

30secondstofly test app for native nodejs implementation of communication with the QPX google flights api

Note: Im not using Mysql to save the api result and query that result for the following reason: As soon as i have the api response i already have what is needed in memory, from my view it would cost performance/time and memory to save it to mysql and then create a query to get the most beneficial flight. In this way im considering that actually not using mysql for this case to be the bonus point ;)

However im using mysql to query for airport infos needed to e.g. get the timzones of origins and destinations.

Momentjs is kind of hard to replace because its covering all the different edge cases and would take quite some time to replace.

I did notes and comments for placed that could be negative interpreted without but are there for one or another reason or in case of todo comments things i would do with more time.

Airports data downloaded from http://openflights.org/data.html
csv2sql: http://www.convertcsv.com/csv-to-sql.htm

Install
	cd /test-app
	npm install

	import mysql database from the files
		- /docu/create_database.sql
		- /docu/airports.dat.converted.sql

	rename /config.js.dist to /config.js 
	 	and enter your api and mysql database credentials in: /config.js

Run
	node index.js

	#with nodemon
	nodemon

Testing

	npm test
	
	#with nodemon
	nodemon -x "npm test"
