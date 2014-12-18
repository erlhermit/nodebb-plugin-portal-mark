'use strict';

/* globals define, app, socket */

define('forum/topic/portalmark', function () {
	var toolbarItemTpl = '<li><a href="#" class="portalmark_thread"><i class="fa fa-fw fa-bookmark"></i> [[portalmark:thread_tools.mark]] </a></li><li><a href="#" class="unportalmark_thread hidden"><i class="fa fa-fw fa-bookmark-o"></i> [[portalmark:thread_tools.unmark]] </a></li>';

	var portalmark = {},
		modal,
		socketId, //settings by caller
		markTag,
		targetMarksLabel;
	portalmark.init = function (appid) {
		socketId = appid;
	};

	portalmark.loadMark = function (callback) {
		callback = callback ? callback : function () {};
		var api_name = '.article.get';
		socket.emit('plugins.' + socketId + api_name, {
			tid: $('[template-variable="topic_id"]').val()
		}, function (err, result) {
			var markEL = findPostMarkEL();
			if (result) {
				//add tags to topic
				renderTopicMark(markEL, result, callback);
				$('.unportalmark_thread').removeClass('hidden');
			} else {
				//cleanup topic
				markEL.empty();
				$('.unportalmark_thread').addClass('hidden');
			}
			loadToolbar();
			callback(err, result);
		});
	};

	portalmark.unmark = function (tids, marktag, onComplete) {
		portalmark.tids = tids;
		portalmark.onComplete = onComplete;
		portalmark.markAll = tids ? false : true;
		portalmark.marktag = marktag;
		portalmark.template = '';
		portalmark.templateTag = '';
		doPortalunmark();
	};
	portalmark.mark = function (tids, marktag, onComplete) {
		portalmark.tids = tids;
		portalmark.onComplete = onComplete;
		portalmark.markAll = tids ? false : true;
		portalmark.marktag = marktag;
		portalmark.template = 'portalmark/mark_thread_modal';
		portalmark.templateTag = '#mark_thread_modal';
		if ($(portalmark.templateTag).length == 0) {
			ajaxify.loadTemplate(portalmark.template, function (template) {
				translator.translate(templates.parse(template), function (translatedTemplate) {
					$('div .topic').append(translatedTemplate);
					doPortalmark();
				});
			});
		} else {
			doPortalmark();
		}
	};

	function doPortalmark() {
		modal = $(portalmark.templateTag);
		modal.on('shown.bs.modal', onPortalmarkModalShown);
		$('#mark-confirm').hide();
		if (portalmark.markAll || (portalmark.tids && portalmark.tids.length > 1)) {
			modal.find('.modal-header h3').translateText('[[portalmark:mark_topics]]');
		}
		modal.modal('show');
	}

	function doPortalunmark() {
		translator.translate('[[portalmark:topic_unmark_warnning]]', function (transdMsg) {
			bootbox.confirm(transdMsg, function (confirm) {
				if (!confirm) {
					return;
				}
				socket.emit('plugins.' + socketId + '.article.unmark', {
					tids: portalmark.tids
				}, function (err) {
					if (err) {
						return app.alertError(err.message);
					}
					translator.translate('[[portalmark:topic_unmark_success]]', app.alertSuccess);
					portalmark.loadMark();
					if (typeof portalmark.onComplete === 'function') {
						portalmark.onComplete();
					}
				});
			});
		});
	}

	function onPortalmarkModalShown() {
		var loadingEl = $('#marks-loading');
		if (!loadingEl.length) {
			return;
		}
		socket.emit('plugins.' + socketId + '.marks.get', [portalmark.marktag], onPortalmarksLoaded);
	}

	function onPortalmarksLoaded(err, marks) {
		if (err) {
			return app.alertError(err.message);
		}
		renderMarkTags(marks);
		modal.on('click', '.mark-list .mark-row', function (e) {
			selectMark($(this));
		});
		$('#mark_thread_commit').on('click', onCommitClicked);
	}

	function selectMark(marktag) {
		var parentTag = marktag.find('[data-name="mark-parent"]').val();
		var tagEL = marktag.html();
		if (parentTag != "" && parentTag != "{marks.parent}") {
			tagEL = modal.find('.mark-row[data-tag="' + parentTag + '"]').html() + tagEL;
		}
		modal.find('#confirm-marks-name').html(tagEL);
		$('#mark-confirm').show();
		markTag = marktag.attr('data-tag');
		targetMarksLabel = marktag.html();
		$('#mark_thread_commit').prop('disabled', portalmark.marktag == markTag);
	}

	function onCommitClicked() {
		var commitEl = $('#mark_thread_commit');
		if (!commitEl.prop('disabled') && markTag) {
			commitEl.prop('disabled', true);
			markTopics();
		}
	}

	function markTopics() {
		var api_name = portalmark.markAll ? '.article.markAll' : '.article.mark';
		socket.emit('plugins.' + socketId + api_name, {
			tids: portalmark.tids,
			markTag: markTag
		}, function (err) {
			modal.modal('hide');
			$('#mark_thread_commit').prop('disabled', false);
			if (err) {
				return app.alertError(err.message);
			}
			translator.translate('[[portalmark:topic_mark_success]]' + targetMarksLabel, app.alertSuccess);
			portalmark.loadMark();
			if (typeof portalmark.onComplete === 'function') {
				portalmark.onComplete();
			}
		});
	}

	function renderMarkTags(marks) {
		templates.parse('portalmark/mark_list', {
			marks: marks
		}, function (html) {
			modal.find('.modal-body').prepend(html);
			$('#marks-loading').remove();
			$('.modal-body [data-toggle="tooltip"]').tooltip();
		});
	}

	function renderTopicMark(markEL, markTag, callback) {
		templates.parse('portalmark/post_mark', markTag, function (html) {
			translator.translate(html, function (translatedTemplate) {
				markEL.html(translatedTemplate);
				$('span.timeago').timeago();
				callback(null, markTag);
			});
		});
	}

	function findPostMarkEL() {
		if ($('div.topic-footer .post-mark').length == 0) {
			$($('div.topic-footer small span')[0]).append(',<span class="post-mark"></span>');
		}
		return $('div.topic-footer .post-mark');
	}

	function loadToolbar() {
		//check is show thread-tools
		if ($('div .thread-tools').length > 0 && $('.portalmark_thread').length == 0) {
			//tools hook
			var api_name = '.marks.check';
			socket.emit('plugins.' + socketId + api_name, {
				tid: $('[template-variable="topic_id"]').val()
			}, function (err, result) {
				if (err) {
					return;
				}
				if (result.pass) {
					translator.translate(toolbarItemTpl, function (translatedTemplate) {
						$('div .thread-tools ul').append(translatedTemplate);
						hookTopic();
						if (result.marked) {
							$('.unportalmark_thread').removeClass('hidden');
						}
					});
				}
			});
		}
	};

	function hookTopic() {
		//topic hook
		$('.portalmark_thread').on('click', function (e) {
			portalmark.mark([$('[template-variable="topic_id"]').val()], $('[template-variable="marks.tag"]').val());
			return false;
		});
		$('.unportalmark_thread').on('click', function (e) {
			portalmark.unmark([$('[template-variable="topic_id"]').val()], $('[template-variable="marks.tag"]').val());
			return false;
		});
	};
	return portalmark;
});
