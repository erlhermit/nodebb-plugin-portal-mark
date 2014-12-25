"use strict";

var winston = require('./nodebb').winston,
	config = require('./config'),
	nodebb = require('./nodebb'),
	linklist = {
		"static:app.load": require('./appload'),
		"filter:privileges.topics.get": require('./foo').filter,
		"filter:topic.thread_tools": require('./foo').filter,
		"filter:topic.get": require('./foo').filter,
		"filter:widgets.getAreas": require('./widgets').getAreas,
		"filter:widgets.getWidgets": require('./widgets').getWidgets,
		"filter:header.build": require('./headerbuild').header,
		"filter:admin.header.build": require('./headerbuild').admin,
		"filter:widget.render:recentArticles": require('./widgets').render.recentArticles,
		"filter:widget.render:popularArticles": require('./widgets').render.popularArticles,
	};

function genhookfunc(hookname,context) {
	var type = hookname.split(':')[0],
		hookfunc = linklist[hookname],
		func;
	if (!hookfunc) {
		return function () {
			winston.warn(config.log.id, 'method not set', hookname)
		};
	}

	//for nodebb v0.6.x
	switch (type) {
	case 'static':
		func = function (params, callback) {
			hookfunc(params.app,params.router, params.middleware, params.controllers, callback,context);
		};
		break;
	case 'filter':
		func = function (params, callback) {
			hookfunc(params, callback,context);
		};
		break;
	case 'action':
		func = function (params) {
			hookfunc(params,context);
		};
		break;
	}
	return func;
}

function genhookfunc5x(hookname,context) {
	var type = hookname.split(':')[0],
		hookfunc = linklist[hookname],
		func;
	if (!hookfunc) {
		return function () {
			winston.warn(config.log.id, 'method not set', hookname)
		};
	}
	//for nodebb v0.5.x
	switch (type) {
	case 'static':
		func = function (app, middleware, controllers, callback) {
			hookfunc(app, middleware, controllers, callback,context);
		};
		break;
	case 'filter':
		func = function (params, callback) {
			hookfunc(params, callback,context);
		};
		break;
	case 'action':
		func = function (params) {
			hookfunc(params,context);
		};
		break;
	}
	return func;
}

function getGenFunc() {
	if (!nodebb.checkVersion('0.5.7')) {
		return genhookfunc5x;
	}
	return genhookfunc;
}
module.exports = function (host, links, context) {
	context = context || {};
	var genfunc = getGenFunc();
	links.forEach(function (set) {
		var members = set.method.split('.');
		var lastnode = members[members.length - 1];
		var hostnode = host;
		members.reduce(function (memo, prop) {
			if (memo !== null && memo[prop]) {} else if (lastnode == prop) {
				memo[prop] = genfunc(set.hook,context);
			} else {
				memo[prop] = {}
			}
			return memo[prop];
		}, hostnode);
	});
	return host;
};
