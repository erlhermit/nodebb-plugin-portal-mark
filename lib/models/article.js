var nodebb = require('../nodebb'),
	Topics = nodebb.Topics,
	db = nodebb.db,
	S = nodebb.S,
	validator = nodebb.validator,
	Plugins = nodebb.Plugins,
	meta = nodebb.meta,
	User = nodebb.User,
	utils = nodebb.utils,
	async = nodebb.async;
var marks = require('./marks');
var config = require('../config');

(function (Article) {
	require('./article/mark')(Article);
	require('./article/unmark')(Article);
	require('./article/views')(Article);

	Article.getTopicsFieldsWithDescription = function (ids, fields, callback){
		Article.getTopicsFields(ids,fields,callback,true);
	};

	Article.getTopicsFields = function (ids, fields, callback, withDescription) {
		var sets = ids.map(function (set) {
			return set.value || set;
		});
		var results = [];
		async.waterfall([
			function (next) {
				Topics.getTopicsFields(sets, fields, function (err, articles) {
					var count = 0;
					for (var i = 0; i < articles.length; i++) {
						if (articles[i].tid == null) {
							models.article.deleteTopicMark(-1, sets[i], function (err) {});
							continue;
						}
						articles[i].index = count;
						articles[i].timestamp = utils.toISOString(ids[i].score);
						articles[i].views = articles[i].views ? articles[i].views : 0;
						if (!articles[i].thumb) articles[i].thumb = meta.config['brand:logo'];
						results[count] = articles[i];
						count++;
					}
					next(err);
				});
			},
			function (next) {
				async.each(results, function (art, next) {
					if (art && art.uid) {
						User.getUserFields(art.uid, ['uid', 'username', 'userslug', 'picture', 'status'], function (err, userData) {
							art.author = userData;
							next();
						});
					} else {
						next();
					}
				}, next);
			},
			function (next) {
				if(!withDescription){
					return callback(null,results);
				}
				async.each(results, function (art, next) {
					db.getObjectField('post:' + art.mainPid, 'content', function (err, data) {
						if (!err) {
							//TODO quality this to mark topic step
							Plugins.fireHook('filter:parse.post', {
								postData: {
									content: data
								},
								uid: -1
							}, function (err, data) {
								var description = S(data.postData.content).stripTags().decodeHTMLEntities().s;
								if (description.length > 255) {
									description = description.substr(0, 255) + '...';
								}
								description = validator.escape(description);
								description = description.replace(/&apos;/g, '&#x27;');
								art.description = description;
								next();
							});
						} else {
							next();
						}
					});
				}, next);
			}
		], function(err){
			callback(err,results);
		});
	}

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
					next(null,null);
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
