var nodebb = require('../nodebb'),
	db = nodebb.db,
	async = nodebb.async;
var config = require('../config');

(function (Marks) {

	require('./marks/exists')(Marks);
	require('./marks/create')(Marks);
	require('./marks/delete')(Marks);
	require('./marks/update')(Marks);
	require('./marks/count')(Marks);
	require('./marks/sub')(Marks);
	require('./marks/topics')(Marks);






	Marks.getMarkTagWithParents = function (markTag, callback) {
		async.waterfall([
			function (next) {
				Marks.getMarkTagWithScore(markTag, next);
			},
			function (tagData, next) {
				if (tagData && tagData.parent) {
					Marks.getMarkTagWithParents(tagData.parent, function (err, parentData) {
						if (!err) {
							tagData.parents = parentData.parents.concat(parentData);
							delete parentData['parents'];
						}
						next(err, tagData)
					});
				} else {
					if (tagData) {
						tagData.parents = [];
					}
					next(null, tagData);
				}
			}
		], callback);
	};
	Marks.getMarkTag = function (markTag, callback) {
		db.getObject(config.db.root + ':mark:' + markTag, function (err, tagData) {
			if (!err) {
				if (tagData && tagData.parent && tagData.parent == 'undefined') {
					delete tagData['parent'];
				}
			}
			callback(err, tagData);
		});
	};
	Marks.getMarkTagWithScore = function (markTag, callback) {
		async.waterfall([
			function (next) {
				Marks.getMarkTag(markTag, next);
			},
			function (tagData, next) {
				Marks.getMarkCount(markTag, function (err, score) {
					if (!err && tagData) {
						tagData.score = score;
					}
					next(err, tagData);
				});
			}
		], callback);
	};

	Marks.getMarkTags = function (start, end, callback) {
		db.getSortedSetRevRangeWithScores(config.db.root + ':marks', start, end, callback);
	};

	Marks.getMarksFields = function (markTags, callback) {
		var keys = markTags.map(function (tag) {
			return config.db.root + ':mark:' + tag.value;
		});
		db.getObjects(keys, function (err, tagData) {
			if (err) {
				return callback(err);
			}

			markTags.forEach(function (tag, index) {
				tag.tag = tagData[index] ? tagData[index].tag : tag.value;
				tag.name = tagData[index] ? tagData[index].name : '';
				tag.parent = tagData[index] && tagData[index].parent != 'undefined' ? tagData[index].parent : '';
			});
			callback(null, markTags);
		});
	};
	Marks.getMarks = function (callback) {
		Marks.getMarkTags(0, 999, function (err, markTags) {
			Marks.getMarksFields(markTags, callback);
		});
	};

}(exports));