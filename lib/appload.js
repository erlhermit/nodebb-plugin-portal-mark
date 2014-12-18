"use strict";

var controllers = require('./controllers'),
	middleware = require('./middleware'),
	routes = require('./routes'),
	socket = require('./socket.io');
module.exports = function (router_, middleware_, controllers_, callback) {
	controllers = controllers.extend(controllers_);
	middleware = middleware(router_, middleware_);
	routes(router_, middleware, controllers);
	socket.init(controllers);
	callback();
};