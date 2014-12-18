"use strict";
var nodebb = require('../nodebb'),
User = nodebb.User,
db = nodebb.db,
S = nodebb.S,
Meta = nodebb.meta,
nconf = nodebb.nconf,
validator = nodebb.validator,
Plugins = nodebb.Plugins,
Topics = nodebb.Topics,
async = nodebb.async;
var config = require('../config');
var models = require('../models');
var articleController = {};
articleController.render = function (req, res, next) {
	var pageCount = 20;
	var tag, tid = req.params.tid,
		slug = req.params.slug,
		page = req.query.page || 1,
		uid = req.user ? req.user.uid : 0,
		userPrivileges;
	async.waterfall([
			function (next) {
				models.article.getTopicMark(tid, next);
			},
			function (result, next) {
				if (result) {
					Topics.getTopicFields(tid, ['tid', 'slug', 'uid', 'title', 'thumb', 'mainPid'], function (err, article) {
						if (article.slug != tid + '/' + slug) {
							return helpers.notFound(req, res);
						}
						result.article = article;
						next(err, result);
					});
				} else {
					return helpers.notFound(req, res);
				}
			},
			function (result, next) {
				//get topic user
				if (result && result.article && result.article.uid) {
					User.getUserFields(result.article.uid, ['uid', 'username', 'userslug', 'picture', 'status'], function (err, userData) {
						result.author = userData;
						next(null, result);
					});
				} else {
					next(null, result);
				}
			},
			function (result, next) {
				if (result) {
					db.getObjectField('post:' + result.article.mainPid, 'content', function (err, data) {
						if (!err) {
							result.article.content = data;
						}
						next(null, result);
					});
				} else {
					return helpers.notFound(req, res);
				}
			},
			function (result, next) {
				Plugins.fireHook('filter:parse.post', {
					postData: {
						content: result.article.content
					},
					uid: -1
				}, function (err, data) {
					result.article.content = data ? data.postData.content : null;
					next(err, result);
				});
			},
			function (result, next) {
				var description = '';

				if (result.article && result.article.content) {
					description = S(result.article.content).stripTags().decodeHTMLEntities().s;
				}

				if (description.length > 255) {
					description = description.substr(0, 255) + '...';
				}

				description = validator.escape(description);
				description = description.replace(/&apos;/g, '&#x27;');

				result.article.description = description;

				var ogImageUrl = Meta.config['brand:logo'];
				// if (topicData.thumb) {
				// 	ogImageUrl = topicData.thumb;
				// } else if(topicData.posts.length && topicData.posts[0] && topicData.posts[0].user && topicData.posts[0].user.picture){
				// 	ogImageUrl = topicData.posts[0].user.picture;
				// } else if(meta.config['brand:logo']) {
				// 	ogImageUrl = meta.config['brand:logo'];
				// } else {
				// 	ogImageUrl = '/logo.png';
				// }
				//
				// if (ogImageUrl.indexOf('http') === -1) {
				// 	ogImageUrl = nconf.get('url') + ogImageUrl;
				// }

				res.locals.metaTags = [{
					name: "title",
					content: result.article.title
				}, {
					name: "description",
					content: description
				}, {
					property: 'og:title',
					content: result.article.title.replace(/&amp;/g, '&')
				}, {
					property: 'og:description',
					content: description
				}, {
					property: "og:type",
					content: 'article'
				}, {
					property: "og:url",
					content: nconf.get('url') + config.header.article.route + '/' + result.article.slug
				}, {
					property: 'og:image',
					content: ogImageUrl
				}, {
					property: "og:image:url",
					content: ogImageUrl
				}, {
					property: "article:published_time",
					content: result.timestamp
				}, {
					property: 'article:modified_time',
					content: result.timestamp
				}, {
					property: 'article:section',
					content: result.tag ? result.tag.name : ''
				}];

				res.locals.linkTags = [{
					rel: 'alternate',
					type: 'application/rss+xml',
					href: nconf.get('url') + +config.header.article.route + '/' + result.article.tid + '.rss'
				}, {
					rel: 'canonical',
					href: nconf.get('url') + config.header.article.route + '/' + result.article.slug
				}, {
					rel: 'up',
					href: nconf.get('url') + config.header.portal.route + '/' + result.tag.tag
				}];

				result['feeds:disableRSS'] = parseInt(Meta.config['feeds:disableRSS'], 10) === 1;
				result.article.index = 0;
				next(null, result);
			}
		],
		function (err, data) {
			if (err) {
				return next(err);
			}
			data.breadcrumbs = res.locals.breadcrumbs
			data.sns_comment_id = config.header.article.route + '/' + data.article.slug
			res.render('article', data);
		});
}
module.exports = articleController;
