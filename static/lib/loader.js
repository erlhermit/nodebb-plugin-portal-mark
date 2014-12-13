"use strict";
$(window).on('action:ajaxify.start', function (ev, data) {
	if (data && data.url.indexOf('article') == 0) {
		require(['cms/article'], function start(article) {
			article.init();
		});
	}
	if (data && data.url.indexOf('portals') == 0) {
		// require(['cms/portals'], function start(portals) {
		// 	portals.init();
		// });
	}
});
//
$(window).on('action:ajaxify.end', function (event, data) {
	if (data && (data.url.indexOf('article') == 0 || data.url.indexOf('portals') == 0)) {
		$('[data-toggle="tooltip"]').tooltip();
	}
	//add share link to .breadcrumb
	if ($('.breadcrumb').length > 0) {
		if ($('#sns-share').length == 0) {
			$('.breadcrumb').prepend('<div id="sns-share" class="pull-right"></div>');
		}
		templates.parse('portalmark/share', {}, function (html) {
			$('#sns-share').html(html);
		});
	}
	if ($('div.dropdown.share-dropdown').length > 0) {
		$('div.dropdown.share-dropdown').remove();
	}
});
//hook topic button action
$(window).on('action:topic.loaded', function (e, data) {
	var socketId = 'nodebb-plugin-portal-mark';
	if ($('div.topic').length > 0) {
		require(['forum/topic/portalmark'], function start(portalmark) {
			portalmark.init(socketId);
			portalmark.loadMark();
		});
	}
});