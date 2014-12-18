var nodebb = require('../../nodebb'),
	db = nodebb.db,
	async = nodebb.async;
var config = require('../../config');

module.exports = function (Marks) {
	Marks.updateMarkTag = function (markTag, data, callback) {
		var oldData;
		async.waterfall([
			function (next) {
				db.getObject(config.db.root + ':mark:' + markTag, next);
			},
			function (result, next) {
				oldData = result;
				if (data.parent) {
					//check parent not itself subtag
					Marks.isExistsMarkSubAll(markTag, data.parent, next);
				} else {
					next(null, false);
				}
			},
			function (exists, next) {
				if (exists) {
					next(new Error('parent [' + data.parent + '] was subtag inside itself or it subtags:' + markTag))
				} else if (oldData && oldData.parent != data.parent) {
					Marks.removeFromTagParent(oldData.parent, markTag, next);
				} else {
					next();
				}
			},
			function (next) {
				async.each(Object.keys(data), function (key, subnext) {
					db.setObjectField(config.db.root + ':mark:' + markTag, key, data[key], subnext);
				}, next);
			},
			function (next) {
				if (data.parent && (!oldData || oldData.parent != data.parent)) {
					db.setAdd(config.db.root + ':mark:' + data.parent + ":sub", markTag, next)
				} else {
					next();
				}
			},
			function (next) {
				Marks.updateMarkCount(markTag, next);
			}
		], callback);
	};
};