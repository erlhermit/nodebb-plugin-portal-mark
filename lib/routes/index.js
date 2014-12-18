"use strict";
var adminRouter = require('./admin'),
	articleRouter = require('./article'),
	portalsRouter = require('./portals');
module.exports = function (router, middleware, controllers) {
	adminRouter(router, middleware, controllers);
	portalsRouter(router, middleware, controllers);
	articleRouter(router, middleware, controllers);

	//replace home router

	router.get('/api/',[middleware.pageView],controllers.portalmark.home.render);
	router.get('/',middleware.buildHeader,[middleware.pageView],controllers.portalmark.home.render);
	router.get('/api/home',[middleware.pageView],controllers.portalmark.home.render);
	router.get('/home',middleware.buildHeader,[middleware.pageView],controllers.portalmark.home.render);

	router.get('/api/forum',[middleware.pageView],controllers.portalmark.forum.render);
	router.get('/forum',middleware.buildHeader,[middleware.pageView],controllers.portalmark.forum.render);
	return router;
}
