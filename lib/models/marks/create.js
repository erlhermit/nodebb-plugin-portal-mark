var nodebb = require('../../nodebb'),
	db = nodebb.db,
	async = nodebb.async;
var config = require('../../config');

module.exports = function (Marks) {
	Marks.createMarkTag = function (markTag, data, callback) {
		Marks.isExistsMark(markTag, function (err, exists) {
			if (exists) {
				return callback(new Error('The mark [' + markTag + '] already exists'));
			}
			async.series([
				function (next) {
					db.setObject(config.db.root + ':mark:' + markTag, data, next);
				},
				function (next) {
					Marks.updateMarkCount(markTag, next);
				}
			], callback);
		});
	};
};