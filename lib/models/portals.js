var nodebb = require('../nodebb'),
	db = nodebb.db,
	async = nodebb.async;
var config = require('../config');

(function (Portals) {
	var terms = {
		day: 86400000,
		week: 604800000,
		month: 2592000000,
		year: 31104000000
	};

	Portals.getAllTopics = function (start, end, callback) {
		db.getSortedSetRevRangeWithScores(config.db.root + ':topics', start, end, callback);
	};

	Portals.getLastTopics = function(start,end,term,callback){

	};
}(exports));
