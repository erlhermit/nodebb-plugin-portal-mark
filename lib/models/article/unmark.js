var nodebb = require('../../nodebb'),
db = nodebb.db,
async = nodebb.async;
var config = require('../../config');
var utils = require('../../utils');
var Marks = require('../marks');
module.exports = function (Article) {

	Article.deleteTopicMark = function (uid, tid, callback) {
		db.getObject(config.db.root + ':topic:' + tid, function (err, tag) {
			var markTag = tag ? tag.tag : null;
			async.series([
				function (next) {
					db.delete(config.db.root + ':topic:' + tid, next);
				},
				function (next) {
					if (markTag) {
						db.sortedSetRemove(config.db.root + ':mark:' + markTag + ':topics', tid, next);
					} else {
						next();
					}
				},
				function (next) {
					if (markTag) {
						Marks.updateMarkCount(markTag, next);
					} else {
						next();
					}
				},
				function (next) {
					//remvoe from generate list
					Article.removeFromGenerate(tid, next);
				}
			], callback);
		});
	};
	Article.unmarkTopics = function (uid, tids, callback) {
		async.eachLimit(tids, 10, function (tid, next) {
			async.waterfall([
					function (next) {
						utils.canMark(tid, uid, next);
					},
					function (canMark, next) {
						if (!canMark) {
							next(new Error('[[error:no-privileges]]' + markTag));
						} else {
							Article.deleteTopicMark(uid, tid, next);
						}
					}
				],
				function (err) {
					if (err) {
						return next(err);
					}
					//TODO:sendNotificationToTopicOwner
					next();
				});
		}, callback);
	};
};
