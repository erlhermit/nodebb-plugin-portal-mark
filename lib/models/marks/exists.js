var nodebb = require('../../nodebb'),
	db = nodebb.db,
	async = nodebb.async;
var config = require('../../config');

module.exports = function (Marks) {
	Marks.isExistsMark = function (markTag, callback) {
		db.isSortedSetMember(config.db.root + ':marks', markTag, callback);
	};


	Marks.isExistsMarkSub = function (markTag, checkSubTag, callback) {
		db.isSetMember(config.db.root + ':mark:' + markTag + ":sub", checkSubTag, callback);
	};
	Marks.isExistsMarkSubAll = function (markTag, checkSubTag, callback) {
		async.waterfall([
				function (next) {
					Marks.isExistsMarkSub(markTag, checkSubTag, next);
				},
				function (exists, next) {
					if (!exists) {
						db.getSetMembers(config.db.root + ':mark:' + markTag + ":sub", function (err, tags) {
							if (!err && tags.length > 0) {
								async.some(tags, function (tag, subnext) {
									Marks.isExistsMarkSubAll(tag, checkSubTag, function (err, result) {
										subnext(result);
									});
								}, next);
							} else {
								next(null, exists);
							}
						});
					} else {
						next(null, exists);
					}
				}
			],
			function (err, exists) {
				callback(err, exists);
			});
	};
};