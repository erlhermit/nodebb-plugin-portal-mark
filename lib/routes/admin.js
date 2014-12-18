"use strict";
var config = require('../config');

function addRoutes(router, middleware, controllers) {
	router.get('/admin' + config.header.admin.route, middleware.admin.buildHeader, controllers.portalmark.admin.renderAdmin)
}

function apiRoutes(router, middleware, controllers) {
	router.get('/api/admin' + config.header.admin.route, controllers.portalmark.admin.renderAdmin)
}

module.exports = function (router, middleware, controllers) {
	addRoutes(router, middleware, controllers);
	apiRoutes(router, middleware, controllers);
};