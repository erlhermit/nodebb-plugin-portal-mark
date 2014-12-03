"use strict";
//hook topic button action
$(window).on('action:topic.loaded', function (e, data) {
	//append needs div
	//$($('.topic-text')[0]).append('<div class="portalmark-tags pull-right inline-block">nihi----</div>');
	//thread-tools btn-group thread-tools dropup dropdown-menu pull-right delete_thread portalmark/mark_thread
	$(document).ready(function () {

		console.info("mark------asdf " + ajaxify);
		ajaxify.loadTemplate('topic', function (threadTpl) {
			var html = "";
			//html = templates.parse(templates.getBlock(threadTpl, 'mark_thread'), {
			//		mark_thread: [{}]
			//});
			//$('.thread-tools .dropdown-menu').append(html);
			console.info("mark------loaded "＋
				threadTpl);
		});
		//hook topic button action
		if ($('.portalmark_thread').length > 0) {
			$('.portalmark_thread').on('click', function () {
				alert('.portalmark_thread click');
			});
		}

	})
});
