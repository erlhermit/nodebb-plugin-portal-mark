var nodebb = require('../nodebb'),
	path = require('path'),
	fs = require('fs'),
	async = nodebb.async;
(function (Widgets) {
	require('./recentArticles')(Widgets);
	require('./popularArticles')(Widgets);


	Widgets.getAreas = function (areas, callback) {
		// console.log('areas',areas);
		areas.push({
			name: 'Article Comment',
			template: 'article.tpl',
			location: 'comment'
		});
		areas.push({
			name: 'Article Sidebar',
			template: 'article.tpl',
			location: 'sidebar'
		});


		areas.push({
			name: 'Portals Sidebar',
			template: 'portals.tpl',
			location: 'sidebar'
		});
		callback(null, areas);
	};

	Widgets.getWidgets = function (widgets, callback, context) {
		widgets = widgets.concat([{
			widget: "recentArticles",
			name: "Recent Articles",
			description: "List of recent articles in a portal.",
			content: context.templates['admin/plugins/widgets/recentarticles.tpl']
		}, {
			widget: "popularArticles",
			name: "Popular Articles",
			description: "List of popular articles in a portal.",
			content: context.templates['admin/plugins/widgets/populararticles.tpl']
		}]);
		callback(null, widgets);
	};

	Widgets.loadTempaltes = function (callback, context) {
		context.templates = context.templates || {};
		var templatesToLoad = [
			"recentarticles.tpl",
			"populararticles.tpl",
			"admin/plugins/widgets/recentarticles.tpl",
			"admin/plugins/widgets/populararticles.tpl"
		];

		function loadTemplate(template, next) {
			fs.readFile(path.resolve(__dirname, '../../static/templates/' + template), function (err, data) {
				if (err) {
					console.log(err.message);
					return next(err);
				}
				context.templates[template] = data.toString();
				next(null);
			});
		}

		async.each(templatesToLoad, loadTemplate);
		callback();
	};
}(module.exports))
