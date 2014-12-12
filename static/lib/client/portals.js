"use strict";
/* global define, config, templates, app, utils, ajaxify, socket, translator */

define('cms/portals', ['composer', 'forum/pagination', 'forum/infinitescroll', 'navigator', 'forum/portalsTools'], function (composer, pagination, infinitescroll, navigator, portalsTools) {
	var Portals = {};
	var articlePerPage = 20;
	$(window).on('action:ajaxify.start', function (ev, data) {
		if (data && data.url.indexOf('portals') !== 0) {
			navigator.hide();
		}
	});

	Portals.init = function () {
		var cid = ajaxify.variables.get('portals_id');
		console.info('useme.');
		app.enterRoom('portals_' + cid);

		$('#new_post').on('click', function () {
			composer.newArticle(cid);
		});

		// socket.removeListener('event:new_topic', Portals.onNewArticle);
		// socket.on('event:new_topic', Portals.onNewArticle);

		enableInfiniteLoadingOrPagination();

		if (!config.usePagination) {
			navigator.init('#topics-container > .portals-item', ajaxify.variables.get('article_count'), Portals.toTop, Portals.toBottom, Portals.navigatorCallback);
		}

		$('#topics-container').on('click', '.topic-title', function () {
			var clickedTid = $(this).parents('li.portals-item[data-tid]').attr('data-tid');
			$('#topics-container li.portals-item').each(function (index, el) {
				if ($(el).offset().top - $(window).scrollTop() > 0) {
					localStorage.setItem('portals:' + cid + ':bookmark', $(el).attr('data-tid'));
					localStorage.setItem('portals:' + cid + ':bookmark:clicked', clickedTid);
					console.info('clicked:', clickedTid);
					return false;
				}
			});

			console.log(history);

		});
		console.log(history);

	};


	Portals.toTop = function () {
		navigator.scrollTop(0);
	};

	Portals.toBottom = function () {
		// socket.emit('categories.getArticleCount', ajaxify.variables.get('portals_id'), function (err, index) {
		// 	navigator.scrollBottom(index);
		// });
	};

	Portals.navigatorCallback = function (element, elementCount) {
		return parseInt(element.attr('data-index'), 10) + 1;
	};

	Portals.highlightArticle = function (tid) {
		var highlight = $('#topics-container li.portals-item[data-tid="' + tid + '"]');
		if (highlight.length && !highlight.hasClass('highlight')) {
			highlight.addClass('highlight');
			setTimeout(function () {
				highlight.removeClass('highlight');
			}, 5000);
		}
	};

	Portals.scrollToArticle = function (tid, clickedTid, duration, offset) {
		if (!tid) {
			return;
		}

		if (!offset) {
			offset = 0;
		}

		if ($('#topics-container li.portals-item[data-tid="' + tid + '"]').length) {
			var cid = ajaxify.variables.get('portals_id');
			var scrollTo = $('#topics-container li.portals-item[data-tid="' + tid + '"]');

			if (cid && scrollTo.length) {
				$('html, body').animate({
					scrollTop: (scrollTo.offset().top - $('#header-menu').height() - offset) + 'px'
				}, duration !== undefined ? duration : 400, function () {
					Portals.highlightArticle(clickedTid);
					navigator.update();
				});
			}
		}
	};

	function enableInfiniteLoadingOrPagination() {
		if (!config.usePagination) {
			infinitescroll.init(Portals.loadMoreArticles);
		} else {
			navigator.hide();
			pagination.init(ajaxify.variables.get('currentPage'), ajaxify.variables.get('pageCount'));
		}
	}

	function updateArticleCount() {
		socket.emit('categories.getArticleCount', ajaxify.variables.get('portals_id'), function (err, topicCount) {
			if (err) {
				return app.alertError(err.message);
			}
			navigator.setCount(topicCount);
		});
	}

	Portals.onArticlesLoaded = function (data, callback) {
		if (!data || !data.topics.length) {
			return;
		}

		function removeAlreadyAddedArticles(topics) {
			return topics.filter(function (topic) {
				return $('#topics-container li[data-tid="' + topic.tid + '"]').length === 0;
			});
		}

		var after = null,
			before = null;

		function findInsertionPoint() {
			if (!$('#topics-container .portals-item[data-tid]').length) {
				return;
			}
			var last = $('#topics-container .portals-item[data-tid]').last();
			var lastIndex = last.attr('data-index');
			var firstIndex = data.topics[data.topics.length - 1].index;
			if (firstIndex > lastIndex) {
				after = last;
			} else {
				before = $('#topics-container .portals-item[data-tid]').first();
			}
		}

		data.topics = removeAlreadyAddedArticles(data.topics);
		if (!data.topics.length) {
			return;
		}

		findInsertionPoint();

		templates.parse('portals', 'topics', data, function (html) {
			translator.translate(html, function (translatedHTML) {
				var container = $('#topics-container'),
					html = $(translatedHTML);

				$('#topics-container, .portals-sidebar').removeClass('hidden');
				$('#portals-no-topics').remove();

				if (config.usePagination) {
					container.empty().append(html);
				} else {
					if (after) {
						html.insertAfter(after);
					} else if (before) {
						html.insertBefore(before);
					} else {
						container.append(html);
					}
				}

				if (typeof callback === 'function') {
					callback();
				}
				html.find('span.timeago').timeago();
				app.createUserTooltips();
				utils.makeNumbersHumanReadable(html.find('.human-readable-number'));
			});
		});
	};

	Portals.loadMoreArticles = function (direction) {
		if (!$('#topics-container').length || !$('#topics-container').children().length) {
			return;
		}

		infinitescroll.calculateAfter(direction, '#topics-container .category-item[data-tid]', articlePerPage, false, function (after, offset, el) {
			loadArticlesAfter(after, function () {
				if (direction < 0 && el) {
					Portals.scrollToArticle(el.attr('data-tid'), null, 0, offset);
				}
			});
		});
	};

	function loadArticlesAfter(after, callback) {
		if (!utils.isNumber(after) || (after === 0 && $('#topics-container li.portals-item[data-index="0"]').length)) {
			return;
		}
		console.log('load after', after);
		// $(window).trigger('action:categories.loading');
		// infinitescroll.loadMore('categories.loadMore', {
		// 	cid: ajaxify.variables.get('portals_id'),
		// 	after: after,
		// 	author: utils.getQueryParams().author
		// }, function (data, done) {
		//
		// 	if (data.topics && data.topics.length) {
		// 		Portals.onArticlesLoaded(data, function () {
		// 			done();
		// 			callback();
		// 		});
		// 		$('#topics-container').attr('data-nextstart', data.nextStart);
		// 	} else {
		// 		done();
		// 	}
		//
		// 	$(window).trigger('action:categories.loaded');
		// });
	}

	return Portals;
});