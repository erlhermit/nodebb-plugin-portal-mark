var nodebb = require('../../nodebb'),
db = nodebb.db,
async = nodebb.async;
var config = require('../../config');
var utils = require('../../utils');
var Marks = require('../marks');
module.exports = function (Article) {

	Article.createTopicMark = function (uid, tid, markTag, timestamp, callback) {
		db.getObject(config.db.root + ':topic:' + tid, function (err, oldTag) {
			async.series([
				function (next) {
					db.setObject(config.db.root + ':topic:' + tid, {
						tag: markTag,
						marker: uid,
						timestamp: timestamp
					}, next);
				},
				function (next) {
					db.sortedSetAdd(config.db.root + ':mark:' + markTag + ':topics', timestamp, tid, next);
				},
				function (next) {
					if (oldTag) {
						db.sortedSetRemove(config.db.root + ':mark:' + oldTag.tag + ':topics', tid, function (err) {
							Marks.updateMarkCount(oldTag.tag);
						});
					}
					Marks.updateMarkCount(markTag, next);
				},
				function (next) {
					//send to generate list
					Article.pushToGenerate(tid, next);
				}
			], callback);
		})
	};
	Article.markTopics = function (uid, tids, markTag, callback) {
		var curCid, timestamp = Date.now();
		async.eachLimit(tids, 10, function (tid, next) {
			async.waterfall([
					function (next) {
						utils.canMark(tid, uid, next);
					},
					function (canMark, next) {
						if (!canMark) {
							next(new Error('[[error:no-privileges]]' + markTag));
						} else {
							Marks.isExistsMark(markTag, next);
						}
					},
					function (exists, next) {
						if (!exists) {
							next(new Error('[[portalmark:err_mark_tag_no_found,' + markTag + ']]'));
						} else {
							Article.createTopicMark(uid, tid, markTag, timestamp, next);
						}
					}
				],
				function (err) {
					if (err) {
						return next(err);
					}

					// websockets.in('topic_' + tid).emit('event:topic_marked', {
					// 	tid: tid
					// });
					//
					// websockets.in('category_' + curCid).emit('event:topic_marked', {
					// 	tid: tid
					// });

					//TODO:sendNotificationToTopicOwner
					next();
				});
		}, callback);
	};

};
