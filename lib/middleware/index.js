"use strict";

var portalmark = {
	breadcrumbs: require('./breadcrumbs')
}

module.exports = function (router, middleware) {
	middleware.portalmark = portalmark;
	return middleware;
}