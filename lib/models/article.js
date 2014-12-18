var nodebb = require('../nodebb'),
	db = nodebb.db,
	User = nodebb.User,
	utils = nodebb.utils,
	async = nodebb.async;
var marks = require('./marks');
var config = require('../config');

(function (Article) {
	require('./article/mark')(Article);
	require('./article/unmark')(Article);
	require('./article/views')(Article);


	Article.getTopic = function (tid, callback) {
		db.getObject(config.db.root + ':topic:' + tid, callback);
	}
	Article.getTopicMark = function (tid, callback) {
		async.waterfall([
			function (next) {
				Article.getTopic(tid, next);
			},
			function (result, next) {
				if (!result) {
					next(null, null);
				} else {
					result.timestamp = utils.toISOString(result.timestamp);
					marks.getMarkTagWithParents(result.tag, function (err, tagData) {
						if (tagData) {
							result.tag = tagData;
							result.parents = tagData.parents;
							delete result.tag['parents'];
							next(err, result);
						} else {
							marks.removeFromGenerate(tid, function () {
								db.delete(config.db.root + ':topic:' + tid, function () {
									next(err, null);
								});
							});
						}
					});
				}
			},
			function (result, next) {
				if (!result) {
					next();
				} else if (result.marker) {
					User.getUserFields(result.marker, ['uid', 'username', 'userslug', 'picture', 'status'], function (err, userData) {
						result.marker = userData;
						next(null, result);
					});
				} else {
					next(null, result);
				}
			}
		], callback);
	};

	Article.pushToGenerate = function (tid, callback) {
		async.series([
			function (next) {
				db.sortedSetAdd(config.db.root + ':gen:pendding', Date.now(), tid, next);
			},
			function (next) {
				db.sortedSetAdd(config.db.root + ':topics', Date.now(), tid, next);
			}
		], callback);
	};
	Article.removeFromGenerate = function (tid, callback) {
		async.series([
			function (next) {
				db.sortedSetRemove(config.db.root + ':gen:pendding', tid, next);
			},
			function (next) {
				db.sortedSetRemove(config.db.root + ':topics', tid, next);
			}
		], callback);
	};
	Article.removeFromGenerateTids = function (tids, callback) {
		async.each(tids, function (tid, next) {
			marks.removeFromGenerate(tid, next);
		}, callback);
	};
	Article.markGenerate = function (tid, callback) {
		db.sortedSetRemove(config.db.root + ':gen:pendding', tid, function (err) {
			if (err) {
				return callback(err);
			}
			db.sortedSetAdd(config.db.root + ':gen:log', Date.now(), tid, callback);
		});
	};
	Article.getGenerateList = function (start, end, callback) {

	};

}(exports));
