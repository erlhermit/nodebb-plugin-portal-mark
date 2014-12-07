"use strict";
var pkgjson = require('./package.json'),
	pluginjson = require('./plugin.json'),
	winston = module.parent.require('winston'),
	privileges = module.parent.require('./privileges'),
	User = module.parent.require('./user'),
	Groups = module.parent.require('./groups'),
	Posts = module.parent.require('./posts'),
	Topics = module.parent.require('./topics'),
	Categories = module.parent.require('./categories'),
	Meta = module.parent.require('./meta'),
	db = module.parent.require('./database'),
	async = module.parent.require('async'),
	websockets = module.parent.require('./socket.io/index'),
	SocketPlugins = module.parent.require('./socket.io/plugins'),
	SocketAdmin = module.parent.require('./socket.io/admin').plugins,
	translator = module.parent.require('../public/src/translator'),
	utils = module.parent.require('../public/src/utils'),
	plugin = module.exports;

var config = {
	lang: "zh_CN",
	group: {
		name: "Marker",
		description: "[[portalmark:group.description]]",
	},
	plugin: {
		name: pluginjson.name,
		id: pluginjson.id,
		version: pkgjson.version,
		description: pluginjson.description,
		icon: 'fa-bookmark',
		route: '/plugins/portalmark'
	},
	template: {
		admin: 'admin/plugins/portalmark'
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
		console.log('update called:', data)
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
			console.log('degin remove: tag ', markTag);
			adminCtl.deleteMarkTag(markTag, next);
		}, callback);
	}
};

var clientHandlers = {
	marks: function (socket, data, callback) {
		console.log('get marks called')
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
		console.log('get callged')
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
				console.info('add to new parent ', data.parent);
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
					next(err);
				});
			} else {
				next();
			}
		},
		function (next) {
			db.delete(config.database.root + ':mark:' + markTag + ':topics', next);
		}
	], function (err) {
		console.log('you did it!')
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
adminCtl.getTopicMark = function (tid, callback) {
	async.waterfall([
		function (next) {
			db.getObject(config.database.root + ':topic:' + tid, next);
		},
		function (result, next) {
			if (!result) {
				next(null, null);
			} else {
				result.timestamp = utils.toISOString(result.timestamp);
				adminCtl.getMarkTagWithParent(result.tag, function (err, tagData) {
					result.tag = tagData;
					result.parents = tagData.parents;
					delete result.tag['parents'];
					next(err, result);
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
					console.log(result);
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
adminCtl.getMarkTagWithParent = function (markTag, callback) {
	async.waterfall([
		function (next) {
			adminCtl.getMarkTagWithScore(markTag, next);
		},
		function (tagData, next) {
			if (tagData.parent) {
				adminCtl.getMarkTagWithParent(tagData.parent, function (err, parentData) {
					if (!err) {
						tagData.parents = parentData.parents.concat(parentData);
						delete parentData['parents'];
					}
					next(err, tagData)
				});
			} else {
				tagData.parents = [];
				next(null, tagData);
			}
		}
	], callback);
};
adminCtl.getMarkTag = function (markTag, callback) {
	db.getObject(config.database.root + ':mark:' + markTag, function (err, tagData) {
		if (!err) {
			if (tagData.parent && tagData.parent == 'undefined') {
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
				if (!err) {
					tagData.score = score;
				}
				next(err, tagData);
			});
		}
	], callback);
};
adminCtl.getMarkTagTopics = function (markTag, start, end, callback) {
	db.getSortedSetRevRange(config.database.root + ':mark:' + markTag + ':topics', start, end, callback);
};
adminCtl.getMarkTags = function (start, end, callback) {
	db.getSortedSetRevRangeWithScores(config.database.root + ':marks', start, end, callback);
};
adminCtl.getMarkTagSub = function (markTag, callback) {
	db.getSetMembers(config.database.root + ':mark:' + markTag + ":sub", callback);
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
	db.sortedSetAdd(config.database.root + ':gen:pendding', tid, Date.now(), callback);
};
adminCtl.removeFromGenerate = function (tid, callback) {
	db.sortedSetRemove(config.database.root + ':gen:pendding', tid, callback);
};
adminCtl.markGenerate = function (tid, callback) {
	adminCtl.removeFromGenerate(tid, function (err) {
		if (err) {
			return callback(err);
		}
		db.sortedSetAdd(config.database.root + ':gen:log', tid, Date.now(), callback);
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
		results.csrf = req.csrfToken();
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

plugin.load = function (app, middleware, controllers, callback) {
	app.get('/admin' + config.plugin.route, middleware.admin.buildHeader, renderAdmin);
	app.get('/api/admin' + config.plugin.route, renderAdmin);

	SocketPlugins[config.plugin.id] = clientHandlers;
	SocketAdmin[config.plugin.id] = adminHandlers;

	setupTranslations(app);

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

plugin.addAdminNavigation = function (header, callback) {
	header.plugins.push({
		route: config.plugin.route,
		icon: config.plugin.icon,
		name: config.plugin.name
	});

	callback(null, header);
};



plugin.filter = {};
plugin.filter.topic = {};
plugin.filter.privileges = {};
plugin.filter.privileges.topics = {};

//check user's role and pass privileges
plugin.filter.privileges.topics.get = function (privileges, callback) {
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
plugin.filter.topic.get = function (topicData, callback) {
	// console.log(topicData);
	// console.log(topicData.category)
	// console.log(topicData.posts)
	// console.log(topicData.portalmark)
	// topicData.portalmark = true;
	// topicData.marks = {
	// 	name: "abcde",
	// 	tag: "bcdef"
	// };
	callback(null, topicData);
}

//only usethis when the api supported other roel check in thread_tools
plugin.filter.topic.thread_tools = function (toolslist, callback) {
	// toolslist.push({
	// 	class: 'portalmark_thread',
	// 	icon: 'fa-bookmark',
	// 	title: '[[portalmark:thread_tools.mark]]'
	// });
	callback(null, toolslist);
}