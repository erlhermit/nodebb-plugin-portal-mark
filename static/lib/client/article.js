'use strict';


/* globals define, app, templates, translator, socket, bootbox, config, ajaxify, RELATIVE_PATH, utils */

define('cms/article', [
	'forum/pagination',
	'navigator'
], function (pagination, navigator) {
	var Article = {},
		currentUrl = '';

	$(window).on('action:ajaxify.start', function (ev, data) {
		if (data.url.indexOf('article') !== 0) {
			navigator.hide();
			$('.header-article-title').find('span').text('').hide();
			app.removeAlert('bookmark');
		}
	});

	Article.init = function () {
		var tid = ajaxify.variables.get('article_id'),
			thread_state = {
				locked: ajaxify.variables.get('locked'),
				deleted: ajaxify.variables.get('deleted'),
				pinned: ajaxify.variables.get('pinned')
			};

		$(window).trigger('action:article.loading');

		app.enterRoom('article_' + tid);

		navigator.init('.posts > .post-row', 1, Article.toTop, Article.toBottom, Article.navigatorCallback, Article.calculateIndex);

		$(window).on('scroll', updateArticleTitle);

		$(window).trigger('action:article.loaded');

		if (app.user.uid) {
			socket.emit('articles.enter', tid, function (err, data) {
				if (err) {
					return app.alertError(err.message);
				}
				browsing.onUpdateUsersInRoom(data);
			});
		}
	};

	Article.toTop = function () {
		navigator.scrollTop(0);
	};

	Article.toBottom = function () {
		// socket.emit('articles.postcount', ajaxify.variables.get('article_id'), function (err, postCount) {
		// 	if (config.articlePostSort !== 'oldest_to_newest') {
		// 		postCount = 1;
		// 	}
		// 	navigator.scrollBottom(postCount - 1);
		// });
	};

	function updateArticleTitle() {
		if ($(window).scrollTop() > 50) {
			$('.header-topic-title').find('span').text(ajaxify.variables.get('article_name')).show();
		} else {
			$('.header-topic-title').find('span').text('').hide();
		}
	}

	Article.calculateIndex = function (index, elementCount) {
		return index;
	};

	Article.navigatorCallback = function (element, elementCount) {
		return 1;
	};


	return Article;
});