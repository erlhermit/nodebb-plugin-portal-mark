"use strict";
var pkgjson = require('./package.json'),
	pluginjson = require('./plugin.json'),
	winston = module.parent.require('winston'),
	User = module.parent.require('./user'),
	Posts = module.parent.require('./posts'),
	Topics = module.parent.require('./topics'),
	Categories = module.parent.require('./categories'),
	Meta = module.parent.require('./meta'),
	db = module.parent.require('./database'),
	async = module.parent.require('async'),
	SocketPlugins = module.parent.require('./socket.io/plugins'),
	SocketAdmin = module.parent.require('./socket.io/admin').plugins,
	plugin = module.exports;

var config = {
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
		topic: {
			propset: "portalmark"
		},
		settings: {},
		marks: {
			key: 'tag',
			name: 'name',
			tag: 'tag',
			parent: 'parent'
		}
	},
	list: {
		mark_set: 'mark',
		mark_sets: 'marks',
		topics: 'topics'
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

		var keyset = config.database.root + ':' + config.list.mark_set + ':' + set[config.database.marks.key];
		var keysets = config.database.root + ':' + config.list.mark_sets;
		db.getObject(keyset, function (err, data) {
			if (data) {
				return callback(new Error('The mark [' + set.tag + '] already exists'));
			}
			db.setObject(keyset, set);
			db.setAdd(keysets, set[config.database.marks.key]);
			callback();
		});
	},
	update: function (socket, data, callback) {
		if (!data) return callback(new Error('data was null.'));
		if (!data.tag) return callback(new Error('please set mark tag.'));

		var set = {};
		set[config.database.marks.name] = !data.name ? data.tag : data.name;
		set[config.database.marks.tag] = data.tag;
		if (data.parent) set[config.database.marks.parent] = data.parent == "" ? undefined : data.parent;

		var keyset = config.database.root + ':' + config.list.mark_set + ':' + set[config.database.marks.key];

		db.getObject(keyset, function (err, data) {
			if (!data) {
				return callback(new Error('The mark [' + set.tag + '] not found.'));
			}
			db.setObjectField(keyset, config.database.marks.name, set[config.database.marks.name]);
			db.setObjectField(keyset, config.database.marks.parent, set[config.database.marks.parent]);
			callback();
		});

	},
	removeMarks: function (socket, data, callback) {
		if (!data) return callback(new Error('data was null.'));
		if (!data.marks) return callback(new Error('please set mark tag.'));
		async.each(data.marks, function (key, next) {
			var keyset = config.database.root + ':' + config.list.mark_set + ':' + key;
			var keysets = config.database.root + ':' + config.list.mark_sets;

			//remove from topic
			//remove from sub tags
			//remove itself
			db.delete(keyset, function () {
				db.setRemove(keysets, key, next);
			});
		}, callback);
	}
};

var clientHandlers = {

};

var adminCtl = {
	getSettings: function (callback) {
		db.getObject(config.database.root + ':settings', function (err, settings) {
			if (err) {
				return callback(err);
			}
			settings = settings || {};

			callback(null, settings);
		});
	},
	getMarks: function (callback) {
		db.getSetMembers(config.database.root + ':' + config.list.mark_sets, function (err, marks) {
			if (err) {
				return callback(err);
			}
			async.map(marks, function (mark, next) {
				db.getObject(config.database.root + ':' + config.list.mark_set + ':' + mark, next);
			}, function (err, results) {
				if (err) {
					return callback(err);
				}
				results.forEach(function (key) {
					if (key) {
						console.info(key);
						if (!key.parent || 'undefined' == key.parent) {
							delete key['parent'];
						} else {

						}
						//get score
						key.score = 0;
					}
				});
				callback(null, results ? results : []);
			});
		});
	},
	getMarkSub: function (tag, callback) {
		db.getSetMembers(config.database.root + ':' + config.list.mark_sets, function (err, marks) {
			if (err) {
				return callback(err);
			}
			async.map(marks, function (mark, next) {
				db.getObject(config.database.root + ':' + config.list.mark_set + ':' + mark, next);
			}, function (err, results) {
				if (err) {
					return callback(err);
				}
				results.forEach(function (key) {
					if (key) {
						console.info(key);

						if (!key.parent || 'null' == key.parent || 'undefined' == key.parent) delete key['parent'];
						else {

						}
						//get score
						key.score = 0;
					}
				});
				callback(null, results ? results : []);
			});
		});
	}

};




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

//////////////////////
// exports
//////////////////////
plugin.init = function (params, callback) {
	console.log(config.plugin.id + ': loaded');

	var app = params.router,
		middleware = params.middleware,
		controllers = params.controllers;

	// We create two routes for every view. One API call, and the actual route itself.
	// Just add the buildHeader middleware to your route and NodeBB will take care of everything for you.

	app.get('/admin' + config.plugin.route, middleware.applyCSRF, middleware.admin.buildHeader, renderAdmin);
	app.get('/api/admin' + config.plugin.route, middleware.applyCSRF, renderAdmin);

	SocketPlugins[config.plugin.id] = clientHandlers;
	SocketAdmin[config.plugin.id] = adminHandlers;

	callback();
};

plugin.addAdminNavigation = function (header, callback) {
	header.plugins.push({
		route: config.plugin.route,
		icon: config.plugin.icon,
		name: config.plugin.name
	});

	callback(null, header);
};

plugin.restrict = {};
plugin.restrict.topic = function (privileges, callback) {
	async.parallel({
		topicObj: async.apply(Topics.getTopicFields, privileges.tid, ['cid', 'uid', 'index']),
		isAdmin: async.apply(User.isAdministrator, privileges.uid)
	}, function (err, data) {
		//TODO: if show mark only
		//TODO: check if is in mark list show
		Topics.setTopicField(privileges.tid, config.database.topic.propset, null);
		callback(null, privileges);
	});
};
