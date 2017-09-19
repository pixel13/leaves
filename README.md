# leaves
Calculate remaining paid leaves and vacations, according to the Italian payroll system

It needs a database (called leaves) that can be initialized this way:

CREATE TABLE `leaves` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `day` tinyint(4) NOT NULL,
  `month` tinyint(4) NOT NULL,
  `year` smallint(6) NOT NULL,
  `hours` decimal(3,2) NOT NULL,
  `vacation` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=151 DEFAULT CHARSET=latin1;

CREATE TABLE `payrolls` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `month` tinyint(4) NOT NULL,
  `year` smallint(6) NOT NULL,
  `leaves` decimal(5,2) NOT NULL,
  `vacations` decimal(5,2) NOT NULL,
  `used_leaves` decimal(5,2) DEFAULT NULL,
  `used_vacations` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=71 DEFAULT CHARSET=latin1;
