var nodebb = require('../../nodebb'),
	db = nodebb.db,
	async = nodebb.async;
var config = require('../../config');

module.exports = function (Marks) {
	Marks.removeFromTagParent = function (parentTag, markTag, callback) {
		db.setRemove(config.db.root + ':mark:' + parentTag + ":sub", markTag, callback);
	};

	Marks.deleteMarkTag = function (markTag, callback) {
		async.series([
				//remove from topic
				function (next) {
					Marks.deleteMarkTagTopics(markTag, next);
				},
				function (next) {
					Marks.deleteMarkTagSub(markTag, next);
				},
				//remove from parent
				function (next) {
					Marks.getMarkTag(markTag, function (err, tagData) {
						if (err || !tagData.parent) {
							next(err);
						} else {
							Marks.removeFromTagParent(tagData.parent, markTag, next);
						}
					});
				},
				//remove itself
				function (next) {
					db.delete(config.db.root + ':mark:' + markTag, next);
				},
				function (next) {
					db.sortedSetRemove(config.db.root + ':marks', markTag, next);
				}
			],
			function (err) {
				callback(err);
			});
	};


};