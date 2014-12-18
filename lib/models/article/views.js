var nodebb = require('../../nodebb'),
db = nodebb.db,
async = nodebb.async;
var config = require('../../config');

module.exports = function (Article) {



	Article.getAndUpdateArticlesVies = function (tids, callback) {
		if (tids) {
			var results = {};
			async.eachLimit(tids, 10, function (tid, next) {
				Article.getAndUpdateArticleViews(tid, function (err, value) {
					results[tid] = err ? 0 : value;
					next();
				})
			}, function (err) {
				callback(err, results);
			});
		} else {
			callback(null, null);
		}
	};
	Article.getAndUpdateArticleViews = function (tid, callback) {
		callback = callback || function () {};
		db.incrObjectFieldBy(config.db.root + ':topic:' + tid, 'views', 1, function (err, value) {
			if (err) {
				return callback(err);
			}
			db.sortedSetAdd(config.db.root + ':views', value, tid, callback);
		});
	};

};
