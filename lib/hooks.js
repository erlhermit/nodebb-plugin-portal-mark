"use strict";

var winston = require('./nodebb').winston,
	config = require('./config'),
	nodebb = require('./nodebb'),
	linklist = {
		"static:app.load": require('./appload'),
		"filter:privileges.topics.get": require('./foo').filter,
		"filter:topic.thread_tools": require('./foo').filter,
		"filter:topic.get": require('./foo').filter,
		"filter:header.build": require('./headerbuild').header,
		"filter:admin.header.build": require('./headerbuild').admin
	};

function genhookfunc(hookname) {
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
			hookfunc(params.router, params.middleware, params.controllers, callback);
		};
		break;
	case 'filter':
		func = function (params, callback) {
			hookfunc(params, callback);
		};
		break;
	case 'action':
		func = function (params) {
			hookfunc(params);
		};
		break;
	}
	return func;
}

function genhookfunc5x(hookname) {
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
		func = function (router, middleware, controllers, callback) {
			hookfunc(router, middleware, controllers, callback);
		};
		break;
	case 'filter':
		func = function (params, callback) {
			hookfunc(params, callback);
		};
		break;
	case 'action':
		func = function (params) {
			hookfunc(params);
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
module.exports = function (host, links) {
	var genfunc = getGenFunc();
	links.forEach(function (set) {
		var members = set.method.split('.');
		var lastnode = members[members.length - 1];
		var hostnode = host;
		members.reduce(function (memo, prop) {
			if (memo !== null && memo[prop]) {} else if (lastnode == prop) {
				memo[prop] = genfunc(set.hook);
			} else {
				memo[prop] = {}
			}
			return memo[prop];
		}, hostnode);
	});
	return host;
};
