"use strict";
var nodebb = require('./nodebb'),
	meta = nodebb.meta,
	db = nodebb.db;
var pluginjson = require('../plugin.json');
(function (conf) {
	conf.lang = 'zh_CN';
	conf.plugin = pluginjson;
	conf.log = {
		id: '[' + pluginjson.id + ']'
	};

	conf.db = {
		root: pluginjson.id
	}

	conf.header = require('./header.json');

	conf.getSettings = function (callback) {
		db.getObject(conf.db.root + ':settings', function (err, settings) {
			if (err) {
				return callback(err);
			}

			settings = settings || require('./settings-default.json');
			callback(null, settings);
		});
	};
}(module.exports));
