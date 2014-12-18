"use strict";
var config = require('../config');

module.exports = function (router, middleware, controllers) {
  router.get('/api' + config.header.portal.route_tag,[middleware.pageView,middleware.portalmark.breadcrumbs.portals],controllers.portalmark.portals.render);
  router.get(config.header.portal.route_tag,middleware.buildHeader,[middleware.pageView,middleware.portalmark.breadcrumbs.portals],controllers.portalmark.portals.render);
};
