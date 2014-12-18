"use strict";
var config = require('../config');

module.exports = function (router, middleware, controllers) {
  router.get('/api' + config.header.article.route_tid_slug,[middleware.pageView,middleware.portalmark.breadcrumbs.article],controllers.portalmark.article.render);
  router.get(config.header.article.route_tid_slug,middleware.buildHeader,[middleware.pageView,middleware.portalmark.breadcrumbs.article],controllers.portalmark.article.render);

};
