"use strict";

var Sokects = {};

var nodebb = require('../nodebb'),
	SocketPlugins = nodebb.SocketPlugins,
	SocketAdmin = nodebb.SocketAdmin;

var config = require('../config');

Sokects.init = function (controllers) {
	SocketPlugins[config.plugin.id] = require('./plugin');
	SocketAdmin[config.plugin.id] = require('./admin');
}
module.exports = Sokects;