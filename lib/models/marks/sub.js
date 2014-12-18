var nodebb = require('../../nodebb'),
	db = nodebb.db,
	async = nodebb.async;
var config = require('../../config');

module.exports = function (Marks) {


	Marks.getMarkTagSub = function (markTag, callback) {
		db.getSetMembers(config.db.root + ':mark:' + markTag + ":sub", callback);
	};
	Marks.getMarkTagSubFields = function (markTag, callback) {
		Marks.getMarkTagSub(markTag, function (err, sets) {
			var keys = sets.map(function (tag) {
				return config.db.root + ':mark:' + tag;
			});
			if (keys && keys.length) {
				db.getObjects(keys, function (err, subs) {
					callback(err, subs);
				});
			} else {
				callback(null, []);
			}
		});
	};

	Marks.deleteMarkTagSub = function (markTag, callback) {
		//remove from sub tags and its sub object
		async.waterfall([
			function (next) {
				Marks.getMarkTagSub(markTag, next)
			},
			function (subs, next) {
				var sets = subs.map(function (subTag) {
					return config.db.root + ':mark:' + subTag;
				});
				async.each(sets, function (set, subnext) {
					db.deleteObjectField(sets, 'parent', subnext);
				}, next);
			},
			function (next) {
				db.delete(config.db.root + ':mark:' + markTag + ':sub', next);
			}
		], callback);
	};

	Marks.getMarkTagSubWithParentSub = function (markTag, callback) {
		async.waterfall([
			function (next) {
				Marks.getMarkTagWithScore(markTag, next);
			},
			function (tagData, next) {
				if (!tagData) {
					return callback(null, null);
				} else if (tagData.parent) {
					Marks.getMarkTagSubFields(tagData.parent, function (err, subs) {
						tagData.tags = subs;
						next(err, tagData);
					});
				} else {
					next(null, tagData);
				}
			},
			function (tagData, next) {
				Marks.getMarkTagSubFields(markTag, function (err, subs) {
					tagData.subs = subs;
					next(err, tagData);
				});
			}
		], callback);
	};
};