var nodebb = require('../nodebb'),
	translator = nodebb.translator,
	templates = nodebb.templates;
var models = require('../models');

module.exports = function (Widgets) {
	Widgets.render = Widgets.render || {};
	Widgets.render.recentArticles = function (widget, callback, context) {
		function getArticles(err, articles) {
			models.article.getTopicsFields(articles, ['tid', 'uid', 'slug', 'title', 'views', 'thumb', 'mainPid'], function (err, data) {
				context.app.render(widget.data.showThumb ? 'articles_thumb' : 'articles', {
					articles: data,
					portal: tag || '',
					numArticles: numArticles,
					showAuthor: widget.data.showAuthor,
					showTime: widget.data.showTime,
					showThumb: widget.data.showThumb,
					className: "recent-articles"
				}, function (err, html) {
					translator.translate(html, function (translatedHTML) {
						callback(err, translatedHTML);
					});
				});
			});
		}

		var config = {};
		for (var n in widget.data) {
			if (n != 'container')
				config[n] = widget.data[n];
		}
		var numArticles = parseInt(widget.data.numArticles,10) -1 || 4,
			showArticles = widget.data.showArticles || null,
			tag;
		var match;
		if (showArticles) {
			getArticles(null, showArticles.split(','));
		} else if (widget.data.showAll) {
			models.portals.getAllTopics(0, numArticles, getArticles);
		} else if (widget.data.marktag) {
			tag = widget.data.marktag;
			models.marks.getMarkTagTopics(tag, 0, numArticles, getArticles);
		} else if (widget.area.url.indexOf('article') == 0) {
			match = widget.area.url.match('article/([0-9]+)');
			var aid = (match && match.length > 1) ? match[1] : null;
			models.article.getTopicMark(aid, function (err, data) {
				if (data && data.tag) {
					tag = data.tag.tag;
					models.marks.getMarkTagTopics(tag, 0, numArticles, getArticles);
				} else {
					models.portals.getAllTopics(0, numArticles, getArticles);
				}
			});
		} else if (widget.area.url.indexOf('portals') == 0) {
			match = widget.area.url.match('portals/([a-zA-Z0-9_-]+)');
			tag = (match && match.length > 1) ? match[1] : null;
			if (tag) {
				models.marks.getMarkTagTopics(tag, 0, numArticles, getArticles);
			} else {
				models.portals.getAllTopics(0, numArticles, getArticles);
			}
		} else if (widget.area.url == '') {
			models.portals.getAllTopics(0, numArticles, getArticles);
		} else {
			models.portals.getAllTopics(0, numArticles, getArticles);
		}
	}
	return Widgets;
}
