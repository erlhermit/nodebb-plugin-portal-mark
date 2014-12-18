"use strict";
var nodebb = require('../nodebb'),
	Topics = nodebb.Topics,
	utils = nodebb.utils,
	Meta = nodebb.meta,
	S = nodebb.S,
	User = nodebb.User,
	validator = nodebb.validator,
	db = nodebb.db,
	Plugins = nodebb.Plugins,
	async = nodebb.async;
var config = require('../config');
var models = require('../models');
var portalsControler = {};

portalsControler.render = function (req, res, next) {
	var pageCount = 20;
	var tag = req.params.tag,
		page = req.query.page || 1,
		uid = req.user ? req.user.uid : 0,
		userPrivileges;
	async.waterfall([
			function (next) {
				models.marks.getMarkTagSubWithParentSub(tag, next);
			},
			function (results, next) {
				if (results) {
					//show tag list
					models.marks.getMarkTagTopics(results.tag, 0, -1, function (err, tids) {
						next(err, results, tids);
					});
				} else {
					models.marks.getMarks(function (err, marks) {
						//show general list
						models.portals.getAllTopics(0, -1, function (err, tids) {
							next(null, {
								subs: marks
							}, tids);
						});
					});
				}
			},
			function (results, tids, next) {
				var sets = tids.map(function (set) {
					return set.value;
				});
				results.articles = [];
				Topics.getTopicsFields(sets, ['tid', 'uid', 'slug', 'title', 'views', 'thumb', 'mainPid'], function (err, articles) {
					var count = 0;
					for (var i = 0; i < articles.length; i++) {
						if(articles[i].tid == null){
							models.article.deleteTopicMark(-1,sets[i],function(err){});
							continue;
						}
						articles[i].index = count;
						articles[i].timestamp = utils.toISOString(tids[i].score);
						articles[i].views = articles[i].views ? articles[i].views : 0;
						if(!articles[i].thumb) articles[i].thumb = Meta.config['brand:logo'];
						results.articles[count] = articles[i];
						count++;
					}
					next(err, results);
				});
			},
			function(results,next){
				//get topic user
				async.each(results.articles,function(art,next){
					if (art && art.uid) {
						User.getUserFields(art.uid, ['uid', 'username', 'userslug', 'picture', 'status'], function (err, userData) {
							art.author = userData;
							next();
						});
					} else {
						next();
					}
				},function(err,data){
					next(null,results);
				})
			},
			function(results,next ){
				async.each(results.articles,function(art,next){
					db.getObjectField('post:' + art.mainPid,'content',function(err,data){
						if (!err) {
							//TODO quality this to mark topic step
							Plugins.fireHook('filter:parse.post', {
								postData: {
									content: data
								},
								uid: -1
							}, function (err, data) {
								var description = S(data.postData.content).stripTags().decodeHTMLEntities().s;
								if (description.length > 255) {
									description = description.substr(0, 255) + '...';
								}
								description = validator.escape(description);
								description = description.replace(/&apos;/g, '&#x27;');
								art.description = description;
								next();
							});
						}else{
							next();
						}
					});
				},function(err,data){
					next(null,results);
				})
			},
			function (results, next) {
				res.locals.metaTags = [{
					name: "title",
					content: '[[portalmark:title.portal]] | ' + (Meta.config.title || 'NodeBB')
				}, {
					name: "description",
					content: Meta.config.description || ''
				}, {
					property: 'og:title',
					content: '[[portalmark:title.portal]] | ' + '[[portalmark:title.index]] | ' + (Meta.config.title || 'NodeBB')
				}, {
					property: 'og:type',
					content: 'website'
				}];

				if (Meta.config['brand:logo']) {
					res.locals.metaTags.push({
						property: 'og:image',
						content: Meta.config['brand:logo']
					});
				}
				next(null, results);
			}
		],
		function (err, data) {
			if (err) {
				return next(err);
			}
			data.breadcrumbs = res.locals.breadcrumbs
			data.article_count = 100;
			res.render('portals', data);
		});
}


module.exports = portalsControler;
