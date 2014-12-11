"use strict";
$(window).on('action:ajaxify.end', function (event, data) {});
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