"use strict";
var nodebb = require('../nodebb'),
	meta = nodebb.meta,
	Categories = nodebb.Categories,
	async = nodebb.async;
var forumControler = {};

forumControler.render = function (req, res, next) {
	async.parallel({
		header: function (next) {
			res.locals.metaTags = [{
				name: "title",
				content: meta.config.title || 'NodeBB'
			}, {
				name: "description",
				content: meta.config.description || ''
			}, {
				property: 'og:title',
				content: 'Index | ' + (meta.config.title || 'NodeBB')
			}, {
				property: 'og:type',
				content: 'website'
			}];

			if (meta.config['brand:logo']) {
				res.locals.metaTags.push({
					property: 'og:image',
					content: meta.config['brand:logo']
				});
			}

			next(null);
		},
		categories: function (next) {
			var uid = req.user ? req.user.uid : 0;
			Categories.getCategoriesByPrivilege(uid, 'find', function (err, categoryData) {
				if (err) {
					return next(err);
				}
				var childCategories = [];

				for (var i = categoryData.length - 1; i >= 0; --i) {

					if (Array.isArray(categoryData[i].children) && categoryData[i].children.length) {
						childCategories.push.apply(childCategories, categoryData[i].children);
					}

					if (categoryData[i].parent && categoryData[i].parent.cid) {
						categoryData.splice(i, 1);
					}
				}

				async.parallel([
					function (next) {
						Categories.getRecentTopicReplies(categoryData, uid, next);
					},
					function (next) {
						Categories.getRecentTopicReplies(childCategories, uid, next);
					}
				], function (err) {
					next(err, categoryData);
				});
			});
		}
	}, function (err, data) {
		if (err) {
			return next(err);
		}
		res.render('forum', data);
	});
};


module.exports = forumControler;
