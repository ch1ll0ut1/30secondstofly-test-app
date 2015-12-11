CREATE SCHEMA IF NOT EXISTS `testapp` DEFAULT CHARACTER SET utf8 ;
USE `testapp` ;

CREATE TABLE IF NOT EXISTS `testapp`.`airport` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `openflights_id` INT UNSIGNED NOT NULL COMMENT 'Unique OpenFlights.org identifier for this airport.',
  `name` VARCHAR(255) NOT NULL COMMENT 'Name of airport. May or may not contain the City name.',
  `city` VARCHAR(255) NULL COMMENT 'Main city served by airport. May be spelled differently from Name.',
  `country` VARCHAR(255) NOT NULL COMMENT 'Country or territory where airport is located.',
  `iata_faa` CHAR(3) NULL COMMENT '3-letter FAA code, for airports located in Country \"United States of America\".' /* comment truncated */ /*3-letter IATA code, for all other airports.
Blank if not assigned.*/,
  `icao` CHAR(4) NULL COMMENT '4-letter ICAO code.' /* comment truncated */ /*Blank if not assigned.*/,
  `latitude` INT NOT NULL COMMENT 'Decimal degrees, usually to six significant digits. Negative is South, positive is North.	',
  `longitude` INT NOT NULL COMMENT 'Decimal degrees, usually to six significant digits. Negative is West, positive is East.',
  `altitude` VARCHAR(255) NOT NULL COMMENT 'In feet.',
  `timezone` DECIMAL(3,1) NOT NULL COMMENT 'Hours offset from UTC. Fractional hours are expressed as decimals, eg. India is 5.5.',
  `dst` CHAR(1) NOT NULL COMMENT 'Daylight savings time. One of E (Europe), A (US/Canada), S (South America), O (Australia), Z (New Zealand), N (None) or U (Unknown). See also: Help: Time',
  `tz` VARCHAR(255) NULL COMMENT 'Timezone in \"tz\" (Olson) format, eg. \"America/Los_Angeles\"',
  PRIMARY KEY (`id`))
ENGINE = MyISAM

/*use "airports.dat.converted.sql to import data*/