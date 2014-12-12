"use strict";
var pkgjson = require('./package.json'),
	pluginjson = require('./plugin.json'),
	nconf = module.parent.require('nconf'),
	winston = module.parent.require('winston'),
	privileges = module.parent.require('./privileges'),
	User = module.parent.require('./user'),
	Groups = module.parent.require('./groups'),
	S = module.parent.require('string'),
	validator = module.parent.require('validator'),
	Posts = module.parent.require('./posts'),
	Topics = module.parent.require('./topics'),
	Categories = module.parent.require('./categories'),
	Meta = module.parent.require('./meta'),
	db = module.parent.require('./database'),
	async = module.parent.require('async'),
	helpers = module.parent.require('./controllers/helpers'),
	websockets = module.parent.require('./socket.io/index'),
	SocketPlugins = module.parent.require('./socket.io/plugins'),
	SocketAdmin = module.parent.require('./socket.io/admin').plugins,
	translator = module.parent.require('../public/src/translator'),
	plugins = module.parent.require('./plugins'),
	utils = module.parent.require('../public/src/utils');
// express removal of routes
(function (protalmark) {
	var config = {
		lang: "zh_CN",
		group: {
			name: "marker",
			description: "[[portalmark:group.description]]",
		},
		plugin: {
			name: pluginjson.name,
			id: pluginjson.id,
			version: pkgjson.version,
			description: pluginjson.description,
		},
		header: {
			admin: {
				name: 'Portal Mark',
				class: '',
				route: '/plugins/portalmark'
			},
			portal: {
				title: '[[portalmark:title.portal]]',
				text: '[[portalmark:title.portal]]',
				iconClass: 'fa-newspaper-o',
				class: '',
				route: '/portals',
				route_tag: '/portals/:tag?'
			},
			article: {
				title: '[[portalmark:title.article]]',
				text: '[[portalmark:title.article]]',
				iconClass: 'fa-rss',
				class: '',
				route: '/article',
				route_tid_slug: '/article/:tid/:slug?'
			},
			forum: {
				title: '[[portalmark:title.forum]]',
				text: '[[portalmark:title.forum]]',
				iconClass: 'fa-comments',
				class: '',
				route: '/forum'
			}
		},
		template: {
			admin: 'admin/plugins/portalmark',
			article: 'article',
			portal: 'portals'
		},
		database: {
			root: pluginjson.id,
			settings: {},
			marks: {
				key: 'tag',
				name: 'name',
				tag: 'tag',
				parent: 'parent'
			}
		}
	};

	var adminHandlers = {
		create: function (socket, data, callback) {
			if (!data) return callback(new Error('data was null.'));
			if (!data.tag) return callback(new Error('please set mark tag.'));

			var set = {};
			set[config.database.marks.name] = !data.name ? data.tag : data.name;
			set[config.database.marks.tag] = data.tag;
			if (data.parent) set[config.database.marks.parent] = data.parent;

			adminCtl.createMarkTag(set[config.database.marks.key], set, callback)
		},
		update: function (socket, data, callback) {
			if (!data) return callback(new Error('data was null.'));
			if (!data.tag) return callback(new Error('please set mark tag.'));
			var set = {};
			set[config.database.marks.name] = !data.name ? data.tag : data.name;
			set[config.database.marks.tag] = data.tag;
			set[config.database.marks.parent] = data.parent == "" ? undefined : data.parent;

			adminCtl.updateMarkTag(set[config.database.marks.key], set, callback);
		},
		removeMarks: function (socket, data, callback) {
			if (!data) return callback(new Error('data was null.'));
			if (!data.marks) return callback(new Error('please set mark tag.'));
			async.each(data.marks, function (markTag, next) {
				adminCtl.deleteMarkTag(markTag, next);
			}, callback);
		}
	};

	var clientHandlers = {
		marks: function (socket, data, callback) {
			adminCtl.getMarks(callback);
		},
		check: function (socket, data, callback) {
			//TODO maybe the topic is locked?
			async.parallel({
				pass: async.apply(adminCtl.canMark, -1, socket.uid),
				marked: data ? async.apply(adminCtl.isExistsTopic, data.tid) : false,
			}, callback);
		},
		get: function (socket, data, callback) {
			adminCtl.getTopicMark(data.tid, callback);
		},
		mark: function (socket, data, callback) {
			if (!data || !Array.isArray(data.tids) || !data.markTag) {
				return callback(new Error('[[error:invalid-data]]'));
			}
			adminCtl.markTopics(socket.uid, data.tids, data.markTag, callback);
		},
		unmark: function (socket, data, callback) {
			if (!data || !Array.isArray(data.tids)) {
				return callback(new Error('[[error:invalid-data]]'));
			}
			adminCtl.unmarkTopics(socket.uid, data.tids, callback);
		}
	};




	//////////////////
	// ADMIN CONTORL WITH DATABASE CONTROL
	////////////////
	var adminCtl = {};
	//for admin control
	adminCtl.getSettings = function (callback) {
		db.getObject(config.database.root + ':settings', function (err, settings) {
			if (err) {
				return callback(err);
			}

			settings = settings || {};
			callback(null, settings);
		});
	};


	adminCtl.unmarkTopics = function (uid, tids, callback) {
		async.eachLimit(tids, 10, function (tid, next) {
			async.waterfall([
					function (next) {
						adminCtl.canMark(tid, uid, next);
					},
					function (canMark, next) {
						if (!canMark) {
							next(new Error('[[error:no-privileges]]' + markTag));
						} else {
							adminCtl.deleteTopicMark(uid, tid, next);
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
	adminCtl.markTopics = function (uid, tids, markTag, callback) {
		var curCid, timestamp = Date.now();
		async.eachLimit(tids, 10, function (tid, next) {
			async.waterfall([
					function (next) {
						adminCtl.canMark(tid, uid, next);
					},
					function (canMark, next) {
						if (!canMark) {
							next(new Error('[[error:no-privileges]]' + markTag));
						} else {
							adminCtl.isExistsMark(markTag, next);
						}
					},
					function (exists, next) {
						if (!exists) {
							next(new Error('[[portalmark:err_mark_tag_no_found,' + markTag + ']]'));
						} else {
							adminCtl.createTopicMark(uid, tid, markTag, timestamp, next);
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

	//for mark tags control
	adminCtl.createMarkTag = function (markTag, data, callback) {
		adminCtl.isExistsMark(markTag, function (err, exists) {
			if (exists) {
				return callback(new Error('The mark [' + markTag + '] already exists'));
			}
			async.series([
				function (next) {
					db.setObject(config.database.root + ':mark:' + markTag, data, next);
				},
				function (next) {
					adminCtl.updateMarkCount(markTag, next);
				}
			], callback);
		});
	};
	adminCtl.updateMarkTag = function (markTag, data, callback) {
		var oldData;
		async.waterfall([
			function (next) {
				db.getObject(config.database.root + ':mark:' + markTag, next);
			},
			function (result, next) {
				oldData = result;
				if (data.parent) {
					//check parent not itself subtag
					adminCtl.isExistsMarkSubAll(markTag, data.parent, next);
				} else {
					next(null, false);
				}
			},
			function (exists, next) {
				if (exists) {
					next(new Error('parent [' + data.parent + '] was subtag inside itself or it subtags:' + markTag))
				} else if (oldData && oldData.parent != data.parent) {
					adminCtl.removeFromTagParent(oldData.parent, markTag, next);
				} else {
					next();
				}
			},
			function (next) {
				async.each(Object.keys(data), function (key, subnext) {
					db.setObjectField(config.database.root + ':mark:' + markTag, key, data[key], subnext);
				}, next);
			},
			function (next) {
				if (data.parent && (!oldData || oldData.parent != data.parent)) {
					db.setAdd(config.database.root + ':mark:' + data.parent + ":sub", markTag, next)
				} else {
					next();
				}
			},
			function (next) {
				adminCtl.updateMarkCount(markTag, next);
			}
		], callback);
	};
	adminCtl.deleteMarkTag = function (markTag, callback) {
		async.series([
				//remove from topic
				function (next) {
					adminCtl.deleteMarkTagTopics(markTag, next);
				},
				function (next) {
					adminCtl.deleteMarkTagSub(markTag, next);
				},
				//remove from parent
				function (next) {
					adminCtl.getMarkTag(markTag, function (err, tagData) {
						if (err || !tagData.parent) {
							next(err);
						} else {
							adminCtl.removeFromTagParent(tagData.parent, markTag, next);
						}
					});
				},
				//remove itself
				function (next) {
					db.delete(config.database.root + ':mark:' + markTag, next);
				},
				function (next) {
					db.sortedSetRemove(config.database.root + ':marks', markTag, next);
				}
			],
			function (err) {
				callback(err);
			});
	};
	adminCtl.deleteMarkTagSub = function (markTag, callback) {
		//remove from sub tags and its sub object
		async.waterfall([
			function (next) {
				adminCtl.getMarkTagSub(markTag, next)
			},
			function (subs, next) {
				var sets = subs.map(function (subTag) {
					return config.database.root + ':mark:' + subTag;
				});
				async.each(sets, function (set, subnext) {
					db.deleteObjectField(sets, 'parent', subnext);
				}, next);
			},
			function (next) {
				db.delete(config.database.root + ':mark:' + markTag + ':sub', next);
			}
		], callback);
	};
	adminCtl.deleteMarkTagTopics = function (markTag, callback) {
		async.waterfall([
			function (next) {
				adminCtl.getMarkTagTopics(markTag, 0, 0, next);
			},
			function (tids, next) {
				//do remove generate files
				var sets = tids.map(function (tid) {
					return config.database.root + ':topic:' + tid;
				});
				if (sets.length) {
					db.deleteAll(sets, function (err) {
						next(err, tids);
					});
				} else {
					next(null, tids);
				}
			},
			//remove from genlist pendding
			function (tids, next) {
				adminCtl.removeFromGenerateTids(tids, next);
			},
			function (next) {
				db.delete(config.database.root + ':mark:' + markTag + ':topics', next);
			}
		], function (err) {
			callback(err);
		});
	};


	//for topic control
	adminCtl.createTopicMark = function (uid, tid, markTag, timestamp, callback) {
		db.getObject(config.database.root + ':topic:' + tid, function (err, oldTag) {
			async.series([
				function (next) {
					db.setObject(config.database.root + ':topic:' + tid, {
						tag: markTag,
						marker: uid,
						timestamp: timestamp
					}, next);
				},
				function (next) {
					db.sortedSetAdd(config.database.root + ':mark:' + markTag + ':topics', timestamp, tid, next);
				},
				function (next) {
					if (oldTag) {
						db.sortedSetRemove(config.database.root + ':mark:' + oldTag.tag + ':topics', tid, function (err) {
							adminCtl.updateMarkCount(oldTag.tag);
						});
					}
					adminCtl.updateMarkCount(markTag, next);
				},
				function (next) {
					//send to generate list
					adminCtl.pushToGenerate(tid, next);
				}
			], callback);
		})
	};
	adminCtl.deleteTopicMark = function (uid, tid, callback) {
		db.getObject(config.database.root + ':topic:' + tid, function (err, tag) {
			var markTag = tag ? tag.tag : null;
			async.series([
				function (next) {
					db.delete(config.database.root + ':topic:' + tid, next);
				},
				function (next) {
					if (markTag) {
						db.sortedSetRemove(config.database.root + ':mark:' + markTag + ':topics', tid, next);
					} else {
						next();
					}
				},
				function (next) {
					if (markTag) {
						adminCtl.updateMarkCount(markTag, next);
					} else {
						next();
					}
				},
				function (next) {
					//remvoe from generate list
					adminCtl.removeFromGenerate(tid, next);
				}
			], callback);
		});
	};
	adminCtl.getTopic = function (tid, callback) {
		db.getObject(config.database.root + ':topic:' + tid, callback);
	}
	adminCtl.getTopicMark = function (tid, callback) {
		async.waterfall([
			function (next) {
				adminCtl.getTopic(tid, next);
			},
			function (result, next) {
				if (!result) {
					next(null, null);
				} else {
					result.timestamp = utils.toISOString(result.timestamp);
					adminCtl.getMarkTagWithParents(result.tag, function (err, tagData) {
						if (tagData) {
							result.tag = tagData;
							result.parents = tagData.parents;
							delete result.tag['parents'];
							next(err, result);
						} else {
							adminCtl.removeFromGenerate(tid, function () {
								db.delete(config.database.root + ':topic:' + tid, function () {
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
	adminCtl.removeFromTagParent = function (parentTag, markTag, callback) {
		db.setRemove(config.database.root + ':mark:' + parentTag + ":sub", markTag, callback);
	};
	adminCtl.getMarkTopicCount = function (markTag, callback) {
		db.sortedSetCard(config.database.root + ':mark:' + markTag + ':topics', callback);
	};
	adminCtl.updateMarkCount = function (markTag, callback) {
		callback = callback || function () {};
		adminCtl.getMarkTopicCount(markTag, function (err, count) {
			if (err) {
				return callback(err);
			}
			db.sortedSetAdd(config.database.root + ':marks', count, markTag, callback);
		})
	};
	adminCtl.getMarkCount = function (markTag, callback) {
		db.sortedSetScore(config.database.root + ':marks', markTag, callback);
	};
	adminCtl.isExistsTopic = function (tid, callback) {
		db.exists(config.database.root + ':topic:' + tid, callback);
	};
	adminCtl.isExistsMark = function (markTag, callback) {
		db.isSortedSetMember(config.database.root + ':marks', markTag, callback);
	};
	adminCtl.isExistsMarkSub = function (markTag, checkSubTag, callback) {
		db.isSetMember(config.database.root + ':mark:' + markTag + ":sub", checkSubTag, callback);
	};
	adminCtl.isExistsMarkSubAll = function (markTag, checkSubTag, callback) {
		async.waterfall([
				function (next) {
					adminCtl.isExistsMarkSub(markTag, checkSubTag, next);
				},
				function (exists, next) {
					if (!exists) {
						db.getSetMembers(config.database.root + ':mark:' + markTag + ":sub", function (err, tags) {
							if (!err && tags.length > 0) {
								async.some(tags, function (tag, subnext) {
									adminCtl.isExistsMarkSubAll(tag, checkSubTag, function (err, result) {
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

	adminCtl.getMarkTagSubWithParentSub = function (markTag, callback) {
		async.waterfall([
			function (next) {
				adminCtl.getMarkTagWithScore(markTag, next);
			},
			function (tagData, next) {
				if (!tagData) {
					return callback(null, null);
				} else if (tagData.parent) {
					adminCtl.getMarkTagSubFields(tagData.parent, function (err, subs) {
						tagData.tags = subs;
						next(err, tagData);
					});
				} else {
					next(null, tagData);
				}
			},
			function (tagData, next) {
				adminCtl.getMarkTagSubFields(markTag, function (err, subs) {
					tagData.subs = subs;
					next(err, tagData);
				});
			}
		], callback);
	};
	adminCtl.getMarkTagWithParents = function (markTag, callback) {
		async.waterfall([
			function (next) {
				adminCtl.getMarkTagWithScore(markTag, next);
			},
			function (tagData, next) {
				if (tagData && tagData.parent) {
					adminCtl.getMarkTagWithParents(tagData.parent, function (err, parentData) {
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
	adminCtl.getMarkTag = function (markTag, callback) {
		db.getObject(config.database.root + ':mark:' + markTag, function (err, tagData) {
			if (!err) {
				if (tagData && tagData.parent && tagData.parent == 'undefined') {
					delete tagData['parent'];
				}
			}
			callback(err, tagData);
		});
	};
	adminCtl.getMarkTagWithScore = function (markTag, callback) {
		async.waterfall([
			function (next) {
				adminCtl.getMarkTag(markTag, next);
			},
			function (tagData, next) {
				adminCtl.getMarkCount(markTag, function (err, score) {
					if (!err && tagData) {
						tagData.score = score;
					}
					next(err, tagData);
				});
			}
		], callback);
	};
	adminCtl.getAllTopics = function (start, end, callback) {
		db.getSortedSetRevRange(config.database.root + ':topics', start, end, callback);
	}
	adminCtl.getMarkTagTopics = function (markTag, start, end, callback) {
		db.getSortedSetRevRange(config.database.root + ':mark:' + markTag + ':topics', start, end, callback);
	};
	adminCtl.getMarkTags = function (start, end, callback) {
		db.getSortedSetRevRangeWithScores(config.database.root + ':marks', start, end, callback);
	};
	adminCtl.getMarkTagSub = function (markTag, callback) {
		db.getSetMembers(config.database.root + ':mark:' + markTag + ":sub", callback);
	};
	adminCtl.getMarkTagSubFields = function (markTag, callback) {
		adminCtl.getMarkTagSub(markTag, function (err, sets) {
			var keys = sets.map(function (tag) {
				return config.database.root + ':mark:' + tag;
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
	adminCtl.getMarksFields = function (markTags, callback) {
		var keys = markTags.map(function (tag) {
			return config.database.root + ':mark:' + tag.value;
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
	adminCtl.getMarks = function (callback) {
		adminCtl.getMarkTags(0, 999, function (err, markTags) {
			adminCtl.getMarksFields(markTags, callback);
		});
	};



	//for visit control
	adminCtl.canMark = function (tid, uid, callback) {
		Groups.isMember(uid, config.group.name, callback);
	};




	//////////////////
	//for server generate pages
	//////////////////
	adminCtl.pushToGenerate = function (tid, callback) {
		async.series([
			function (next) {
				db.sortedSetAdd(config.database.root + ':gen:pendding', Date.now(), tid, next);
			},
			function (next) {
				db.sortedSetAdd(config.database.root + ':topics', Date.now(), tid, next);
			}
		], callback);
	};
	adminCtl.removeFromGenerate = function (tid, callback) {
		async.series([
			function (next) {
				db.sortedSetRemove(config.database.root + ':gen:pendding', tid, next);
			},
			function (next) {
				db.sortedSetRemove(config.database.root + ':topics', tid, next);
			}
		], callback);
	};
	adminCtl.removeFromGenerateTids = function (tids, callback) {
		async.each(tids, function (tid, next) {
			adminCtl.removeFromGenerate(tid, next);
		}, callback);
	};
	adminCtl.markGenerate = function (tid, callback) {
		db.sortedSetRemove(config.database.root + ':gen:pendding', tid, function (err) {
			if (err) {
				return callback(err);
			}
			db.sortedSetAdd(config.database.root + ':gen:log', Date.now(), tid, callback);
		});
	};
	adminCtl.getGenerateList = function (start, end, callback) {

	};




	/////////////////
	// middleware
	/////////////////
	var middle = {};
	middle.buildPortalBreadcrumbs = function (req, res, next) {
		var tag = req.params.tag
		var breadcrumbs = [{
			text: '[[portalmark:title.portal]]',
			url: nconf.get('relative_path') + config.header.portal.route
		}];
		async.waterfall([
			function (next) {
				if (!tag) {
					breadcrumbs.push({
						text: '[[portalmark:title.all]]'
					});
					next(null, null);
				} else {
					adminCtl.getMarkTagWithParents(tag, next);
				}
			},
			function (result, next) {
				if (result) {
					var arr = result.parents.concat([{
						name: result.name,
						tag: result.tag,
						score: result.score
					}]);
					for (var i = 0; i < arr.length; i++) {
						var set = arr[i];
						breadcrumbs.push({
							text: set.name,
							url: nconf.get('relative_path') + config.header.portal.route + '/' + set.tag,
							score: set.score
						});
					}

				}
				res.locals.breadcrumbs = breadcrumbs || [];
				next();
			}
		], next);
	};
	middle.buildArticleBreadcrumbs = function (req, res, next) {
		var tid = req.params.tid
		var slug = req.params.slug
		var breadcrumbs = [{
			text: '[[portalmark:title.portal]]',
			url: nconf.get('relative_path') + config.header.portal.route
		}];
		async.waterfall([
			function (next) {
				adminCtl.getTopic(tid, function (err, result) {
					next(null, result ? result.tag : null);
				});
			},
			function (tag, next) {
				if (!tag) {
					breadcrumbs.push({
						text: '[[portalmark:title.all]]'
					});
					next(null, null);
				} else {
					adminCtl.getMarkTagWithParents(tag, next);
				}
			},
			function (result, next) {
				if (result) {
					var arr = result.parents.concat([{
						name: result.name,
						tag: result.tag,
						score: result.score
					}]);
					for (var i = 0; i < arr.length; i++) {
						var set = arr[i];
						breadcrumbs.push({
							text: set.name,
							url: nconf.get('relative_path') + config.header.portal.route + '/' + set.tag,
							score: set.score
						});
					}

				}
				res.locals.breadcrumbs = breadcrumbs || [];
				next();
			}
		], next);
	};
	middle.addArticleSlug = function (req, res, next) {
		next();
	};









	///////////////////////
	//for route controller
	////////////////////
	var routeCtl = {};
	routeCtl.getMarks = function (callback) {
		adminCtl.getMarks(callback);
	};

	function renderHomepage(reg, res, next) {
		res.render('homepage', {
			page: 'hello'
		});
	}

	function renderArticle(req, res, next) {
		var pageCount = 20;
		var tag, tid = req.params.tid,
			slug = req.params.slug,
			page = req.query.page || 1,
			uid = req.user ? req.user.uid : 0,
			userPrivileges;
		async.waterfall([
				function (next) {
					adminCtl.getTopicMark(tid, next);
				},
				function (result, next) {
					if (result) {
						Topics.getTopicFields(tid, ['tid', 'slug', 'uid', 'title', 'mainPid'], function (err, article) {
							if (article.slug != tid + '/' + slug) {
								return helpers.notFound(req, res);
							}
							result.article = article;
							next(err, result);
						});
					} else {
						return helpers.notFound(req, res);
					}
				},
				function (result, next) {
					if (result) {
						db.getObjectField('post:' + result.article.mainPid, 'content', function (err, data) {
							if (!err) {
								result.article.content = data;
							}
							next(null, result);
						});
					} else {
						return helpers.notFound(req, res);
					}
				},
				function (result, next) {
					plugins.fireHook('filter:parse.post', {
						postData: {
							content: result.article.content
						},
						uid: -1
					}, function (err, data) {
						result.article.content = data ? data.postData.content : null;
						next(err, result);
					});
				},
				function (result, next) {
					var description = '';

					if (result.article && result.article.content) {
						description = S(result.article.content).stripTags().decodeHTMLEntities().s;
					}

					if (description.length > 255) {
						description = description.substr(0, 255) + '...';
					}

					description = validator.escape(description);
					description = description.replace(/&apos;/g, '&#x27;');

					result.article.description = description;

					var ogImageUrl = Meta.config['brand:logo'];
					// if (topicData.thumb) {
					// 	ogImageUrl = topicData.thumb;
					// } else if(topicData.posts.length && topicData.posts[0] && topicData.posts[0].user && topicData.posts[0].user.picture){
					// 	ogImageUrl = topicData.posts[0].user.picture;
					// } else if(meta.config['brand:logo']) {
					// 	ogImageUrl = meta.config['brand:logo'];
					// } else {
					// 	ogImageUrl = '/logo.png';
					// }
					//
					// if (ogImageUrl.indexOf('http') === -1) {
					// 	ogImageUrl = nconf.get('url') + ogImageUrl;
					// }

					res.locals.metaTags = [{
						name: "title",
						content: result.article.title
					}, {
						name: "description",
						content: description
					}, {
						property: 'og:title',
						content: result.article.title.replace(/&amp;/g, '&')
					}, {
						property: 'og:description',
						content: description
					}, {
						property: "og:type",
						content: 'article'
					}, {
						property: "og:url",
						content: nconf.get('url') + config.header.article.route + '/' + result.article.slug
					}, {
						property: 'og:image',
						content: ogImageUrl
					}, {
						property: "og:image:url",
						content: ogImageUrl
					}, {
						property: "article:published_time",
						content: result.timestamp
					}, {
						property: 'article:modified_time',
						content: result.timestamp
					}, {
						property: 'article:section',
						content: result.tag ? result.tag.name : ''
					}];

					res.locals.linkTags = [{
						rel: 'alternate',
						type: 'application/rss+xml',
						href: nconf.get('url') + +config.header.article.route + '/' + result.article.tid + '.rss'
					}, {
						rel: 'canonical',
						href: nconf.get('url') + config.header.article.route + '/' + result.article.slug
					}, {
						rel: 'up',
						href: nconf.get('url') + config.header.portal.route + '/' + result.tag.tag
					}];

					result['feeds:disableRSS'] = parseInt(Meta.config['feeds:disableRSS'], 10) === 1;
					result.article.index = 0;
					next(null, result);
				}
			],
			function (err, data) {
				if (err) {
					return next(err);
				}
				data.breadcrumbs = res.locals.breadcrumbs
				data.sns_comment_id = config.header.article.route + '/' + data.article.slug
				res.render(config.template.article, data);
			});
	}

	function renderPortal(req, res, next) {
		var pageCount = 20;
		var tag = req.params.tag,
			page = req.query.page || 1,
			uid = req.user ? req.user.uid : 0,
			userPrivileges;
		async.waterfall([
				function (next) {
					adminCtl.getMarkTagSubWithParentSub(tag, next);
				},
				function (results, next) {
					if (results) {
						//show tag list
						adminCtl.getMarkTagTopics(results.tag, 0, -1, function (err, tids) {
							next(err, results, tids);
						});
					} else {
						adminCtl.getMarks(function (err, marks) {
							//show general list
							adminCtl.getAllTopics(0, -1, function (err, tids) {
								next(null, {
									subs: marks
								}, tids);
							});
						});
					}
				},
				function (results, tids, next) {
					Topics.getTopicsFields(tids, ['tid', 'uid', 'slug', 'title', 'mainPid'], function (err, articles) {
						for (var i = 0; i < articles.length; i++) {
							articles[i].index = i;
						}
						results.articles = articles;
						next(err, results);
					});
				},
				function (results, next) {
					res.locals.metaTags = [{
						name: "title",
						content: '[[portalmark:title.portal]] | ' + (Meta.config.title || 'NodeBB')
					}, {
						name: "description",
						content: Meta.config.description || ''
					}, {
						property: 'og:title',
						content: '[[portalmark:title.portal]] | ' + '[[portalmark:title.index]] | ' + (Meta.config.title || 'NodeBB')
					}, {
						property: 'og:type',
						content: 'website'
					}];

					if (Meta.config['brand:logo']) {
						res.locals.metaTags.push({
							property: 'og:image',
							content: Meta.config['brand:logo']
						});
					}
					next(null, results);
				}
			],
			function (err, data) {
				if (err) {
					return next(err);
				}
				data.breadcrumbs = res.locals.breadcrumbs
				data.article_count = 100;
				console.log(data)
				res.render(config.template.portal, data);
			});
	}

	//copy from controllers.home change use template 'forum.tpl'
	function renderForum(req, res, next) {
		async.parallel({
			header: function (next) {
				res.locals.metaTags = [{
					name: "title",
					content: Meta.config.title || 'NodeBB'
				}, {
					name: "description",
					content: Meta.config.description || ''
				}, {
					property: 'og:title',
					content: 'Index | ' + (Meta.config.title || 'NodeBB')
				}, {
					property: 'og:type',
					content: 'website'
				}];

				if (Meta.config['brand:logo']) {
					res.locals.metaTags.push({
						property: 'og:image',
						content: Meta.config['brand:logo']
					});
				}

				next(null);
			},
			categories: function (next) {
				var uid = req.user ? req.user.uid : 0;
				Categories.getCategoriesByPrivilege(uid, 'find', function (err, categoryData) {
					if (err) {
						return next(err);
					}
					var childCategories = [];

					for (var i = categoryData.length - 1; i >= 0; --i) {

						if (Array.isArray(categoryData[i].children) && categoryData[i].children.length) {
							childCategories.push.apply(childCategories, categoryData[i].children);
						}

						if (categoryData[i].parent && categoryData[i].parent.cid) {
							categoryData.splice(i, 1);
						}
					}

					async.parallel([
						function (next) {
							Categories.getRecentTopicReplies(categoryData, uid, next);
						},
						function (next) {
							Categories.getRecentTopicReplies(childCategories, uid, next);
						}
					], function (err) {
						next(err, categoryData);
					});
				});
			}
		}, function (err, data) {
			if (err) {
				return next(err);
			}
			res.render('forum', data);
		});
	};

	//////////////////////
	// exports
	//////////////////////
	function renderAdmin(req, res, next) {
		async.parallel({
			marks: function (next) {
				adminCtl.getMarks(next);
			},
			settings: function (next) {
				adminCtl.getSettings(next);
			}
		}, function (err, results) {
			if (err) {
				return next(err);
			}
			res.render(config.template.admin, results);
		});
	}

	function setupTranslations(app) {
		// todo: need to add all translations in directory

		translator.addTranslation(config.lang, 'portalmark', require('./static/language/' + config.lang + '/portalmark.json'));

		app.get('/language/' + config.lang + '/portalmark.json', function (req, res, next) {
			res.status(200).send(require('./static/language/' + config.lang + '/portalmark.json'));
		});
	}

	function setupPageRoute(router, name, middleware, middlewares, controller) {
		middlewares = middlewares.concat([middleware.incrementPageViews, middleware.updateLastOnlineTime]);

		router.get(name, middleware.buildHeader, middlewares, controller);
		router.get('/api' + name, middlewares, controller);
	}

	protalmark.init = function (params, callback) {
		params.router.get('/admin' + config.header.admin.route, params.middleware.admin.buildHeader, renderAdmin);
		params.router.get('/api/admin' + config.header.admin.route, renderAdmin);
		//for marked articles
		setupPageRoute(params.router, config.header.portal.route_tag, params.middleware, [middle.buildPortalBreadcrumbs], renderPortal);
		setupPageRoute(params.router, config.header.article.route_tid_slug, params.middleware, [middle.buildArticleBreadcrumbs, middle.addArticleSlug], renderArticle);
		//TODO:replace default page route?
		setupPageRoute(params.router, '/', params.middleware, [], renderHomepage);
		setupPageRoute(params.router, '/home', params.middleware, [], renderForum);
		setupPageRoute(params.router, '/forum', params.middleware, [], renderForum);

		//socket api
		SocketPlugins[config.plugin.id] = clientHandlers;
		SocketAdmin[config.plugin.id] = adminHandlers;

		setupTranslations(params.router);
		//setup needs groups to finish initialization
		Groups.exists(config.group.name, function (err, exists) {
			if (!exists) {
				translator.translate(config.group.description, config.lang, function (desc) {
					Groups.create(config.group.name, desc, function (err) {
						console.log(config.plugin.id + ': create group [' + config.group.name + ': ' + desc + ']');
						callback();
					});
				});
			} else {
				callback();
			}
		});
	};

	protalmark.filter = {};
	protalmark.filter.header = {};
	protalmark.filter.admin = {};
	protalmark.filter.admin.header = {};
	protalmark.filter.topic = {};
	protalmark.filter.privileges = {};
	protalmark.filter.privileges.topics = {};

	//change page header
	protalmark.filter.header.build = function (header, callback) {
		header.navigation.push(config.header.portal);
		callback(null, header);
	};

	protalmark.filter.admin.header.build = function (header, callback) {
		header.plugins.push(config.header.admin);
		callback(null, header);
	};

	//check user's role and pass privileges
	protalmark.filter.privileges.topics.get = function (privileges, callback) {
		async.parallel({
			// topicData: async.apply(Topics.getTopicFields, privileges.tid, ['cid', 'uid', 'index', 'portalmark']),
			// isAdmin: async.apply(User.isAdministrator, privileges.uid),
			isMarker: async.apply(adminCtl.canMark, privileges.tid, privileges.uid)
		}, function (err, data) {
			//show thread_tools if user is a marker
			privileges.view_thread_tools = privileges.view_thread_tools || data.isMarker;
			callback(null, privileges);
		});
	};
	//set topic marks
	protalmark.filter.topic.get = function (topicData, callback) {
		//change or add topic data
		// console.log('topic:', topicData)
		callback(null, topicData);
	}

	//only usethis when the api supported other roel check in thread_tools
	protalmark.filter.topic.thread_tools = function (toolslist, callback) {
		// toolslist.push({
		// 	class: 'portalmark_thread',
		// 	icon: 'fa-bookmark',
		// 	title: '[[portalmark:thread_tools.mark]]'
		// });
		callback(null, toolslist);
	}
}(module.exports));