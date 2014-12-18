var nodebb = require('../../nodebb'),
	db = nodebb.db,
	async = nodebb.async;
var config = require('../../config'),
	Article = require('../article');

module.exports = function (Marks) {
	Marks.isExistsTopic = function (tid, callback) {
		db.exists(config.db.root + ':topic:' + tid, callback);
	};
	Marks.getAllTopcisCount = function (callback) {

	};
	Marks.getMarkTagTopicsCount = function (tag, callback) {

	};
	Marks.getMarkTagTopics = function (markTag, start, end, callback) {
		db.getSortedSetRevRangeWithScores(config.db.root + ':mark:' + markTag + ':topics', start, end, callback);
	};
	Marks.getMarkTopicCount = function (markTag, callback) {
		db.sortedSetCard(config.db.root + ':mark:' + markTag + ':topics', callback);
	};
	Marks.deleteMarkTagTopics = function (markTag, callback) {
		async.waterfall([
			function (next) {
				Marks.getMarkTagTopics(markTag, 0, 0, next);
			},
			function (tids, next) {
				//do remove generate files
				var sets = tids.map(function (tid) {
					return config.db.root + ':topic:' + tid;
				});
				if (sets.length) {
					db.deleteAll(sets, function (err) {
						next(err, tids);
					});
				} else {
					next(null, tids);
				}
			},
			//remove from genlist pendding
			function (tids, next) {
				Article.removeFromGenerateTids(tids, next);
			},
			function (next) {
				db.delete(config.db.root + ':mark:' + markTag + ':topics', next);
			}
		], function (err) {
			callback(err);
		});
	};

};