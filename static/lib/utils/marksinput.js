"use strict";
define('admin/plugins/portalmark/marksinput', [], function () {
	var socketId = 'nodebb-plugin-portal-mark';
	var marksinput = {},
		modal,markTag,callback,
		timeoutId = 0;

	function findForm(target, tagName) {
		if (!target) return null;
		if ($(target).length == 0) return null;
		if ($(target).prop('tagName') == tagName) return $(target);
		return findForm($(target).parent(), tagName);
	}

	marksinput.init = function () {
		var inputEL = $('.marks-input');
		if (!inputEL.length) {
			return;
		}
		inputEL.on('click', function () {
      var $this = $(this);
      var targetName = $this.attr('input-target');
			var form = findForm($this, 'FORM') || $this.parent().parent();
			var target = form.find('[name="' + targetName + '"]');
      $this.html('<i class="fa fa-spinner fa-spin"></i>')
			if (target.length > 0) {
				marksinput.mark(function (markTag) {
          if(markTag){
            target.val(markTag);
          }
          $this.html('<i class="fa fa-hand-o-up"></i>')
				});
			}
		});
	};

	marksinput.mark = function (onComplete) {
		if ($('#mark_choose_modal').length == 0) {
			ajaxify.loadTemplate('portalmark/mark_choose_modal', function (template) {
				translator.translate(templates.parse(template), function (translatedTemplate) {
					$('body').append(translatedTemplate);
					doChoose('#mark_choose_modal', onComplete);
				});
			});
		} else {
			doChoose('#mark_choose_modal', onComplete);
		}
	};

	function doChoose(templateTag, onComplete) {
    callback = onComplete
		modal = $(templateTag);
		modal.on('shown.bs.modal', onPortalmarkModalShown);
    modal.on('hidden.bs.modal', function(){
      onComplete(null)
    })
		$('#mark-confirm').hide();
		modal.find('.modal-header h3').translateText('Choose Portals');
		modal.modal('show');
	}

	function onPortalmarkModalShown() {
		var loadingEl = $('#marks-loading');
		if (!loadingEl.length) {
			return;
		}
		socket.emit('plugins.' + socketId + '.marks.get', [], function (err, data) {
			if (err) {
				return app.alertError(err.message);
			}

			templates.parse('portalmark/mark_list', {
				marks: data
			}, function (html) {
				modal.find('.modal-body .data-list').html(html);
				$('#marks-loading').remove();
				$('.modal-body [data-toggle="tooltip"]').tooltip();
			});

			modal.on('click', '.mark-list .mark-row', function (e) {
				selectMark($(this));
			});
			$('#mark_thread_commit').on('click', function(){
        modal.modal('hide');
        var commitEl = $('#mark_thread_commit');
        if (!commitEl.prop('disabled') && markTag) {
          commitEl.prop('disabled', true);
          if (typeof callback === 'function') {
            callback(markTag);
          }
        }
      });
		});
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
    $('#mark_thread_commit').prop('disabled', !markTag);
  }

	return marksinput
});
