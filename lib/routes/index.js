"use strict";
var adminRouter = require('./admin'),
	articleRouter = require('./article'),
	portalsRouter = require('./portals');
module.exports = function (router, middleware, controllers) {
	adminRouter(router, middleware, controllers);
	portalsRouter(router, middleware, controllers);
	articleRouter(router, middleware, controllers);

	return router;
}
