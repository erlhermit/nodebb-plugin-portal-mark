var nodebb = require('../../nodebb'),
	db = nodebb.db,
	async = nodebb.async;
var config = require('../../config');

module.exports = function (Marks) {
	Marks.getMarkCount = function (markTag, callback) {
		db.sortedSetScore(config.db.root + ':marks', markTag, callback);
	};
	Marks.updateMarkCount = function (markTag, callback) {
		callback = callback || function () {};
		Marks.getMarkTopicCount(markTag, function (err, count) {
			if (err) {
				return callback(err);
			}
			db.sortedSetAdd(config.db.root + ':marks', count, markTag, callback);
		})
	};



};