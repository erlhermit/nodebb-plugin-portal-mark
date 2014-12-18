var breadcrumbs = {};

var nodebb = require('../nodebb'),
nconf = nodebb.nconf,
 async = nodebb.async;

var config = require('../config'),
models = require('../models');

breadcrumbs.portals = function (req, res, next) {
	var tag = req.params.tag
	var breadcrumbs = [{
		text: '[[portalmark:title.portal]]',
		url: nconf.get('relative_path') + config.header.portal.route
	}];
	async.waterfall([
		function (next) {
			if (!tag) {
				breadcrumbs.push({
					text: '[[portalmark:title.all]]'
				});
				next(null, null);
			} else {
				models.marks.getMarkTagWithParents(tag, next);
			}
		},
		function (result, next) {
			if (result) {
				var arr = result.parents.concat([{
					name: result.name,
					tag: result.tag,
					score: result.score
				}]);
				for (var i = 0; i < arr.length; i++) {
					var set = arr[i];
					breadcrumbs.push({
						text: set.name,
						url: nconf.get('relative_path') + config.header.portal.route + '/' + set.tag,
						score: set.score
					});
				}

			}
			res.locals.breadcrumbs = breadcrumbs || [];
			next();
		}
	], next);
};


breadcrumbs.article = function (req, res, next) {
	var tid = req.params.tid
	var slug = req.params.slug
	var breadcrumbs = [{
		text: '[[portalmark:title.portal]]',
		url: nconf.get('relative_path') + config.header.portal.route
	}];
	async.waterfall([
		function (next) {
			models.article.getTopic(tid, function (err, result) {
				next(null, result ? result.tag : null);
			});
		},
		function (tag, next) {
			if (!tag) {
				breadcrumbs.push({
					text: '[[portalmark:title.all]]'
				});
				next(null, null);
			} else {
				models.marks.getMarkTagWithParents(tag, next);
			}
		},
		function (result, next) {
			if (result) {
				var arr = result.parents.concat([{
					name: result.name,
					tag: result.tag,
					score: result.score
				}]);
				for (var i = 0; i < arr.length; i++) {
					var set = arr[i];
					breadcrumbs.push({
						text: set.name,
						url: nconf.get('relative_path') + config.header.portal.route + '/' + set.tag,
						score: set.score
					});
				}

			}
			res.locals.breadcrumbs = breadcrumbs || [];
			next();
		}
	], next);
};


module.exports = breadcrumbs;
