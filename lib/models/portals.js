var nodebb = require('../nodebb'),
	db = nodebb.db,
	async = nodebb.async;
var config = require('../config');

(function (Portals) {
	Portals.getAllTopics = function (start, end, callback) {
		db.getSortedSetRevRangeWithScores(config.db.root + ':topics', start, end, callback);
	}

}(exports));
