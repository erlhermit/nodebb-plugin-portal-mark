"use strict";
define('admin/plugins/portalmark', ['forum/infinitescroll', 'admin/modules/selectable'], function (infinitescroll, selectable) {
	var socketId = 'nodebb-plugin-portal-mark';
	var marks = {},
		timeoutId = 0;
	marks.init = function () {
		//handleColorPickers();
		selectable.enable('.tag-management', '.tag-row');
		handleNew();
		//handleSearch();
		handleModify();
		handleDeleteSelected();
	};

	function handleNew() {
		$('#new').on('click', function (ev) {
			var newmarkmodal = $('.marks').find('.new-mark-modal'),
				title = 'Add New Mark';
			bootbox.dialog({
				title: title,
				message: newmarkmodal.html(),
				buttons: {
					success: {
						label: "Save",
						className: "btn-primary save",
						callback: function () {
							var modal = $('.bootbox'),
								name = modal.find('[data-name="mark-name"]').val(),
								tag = modal.find('[data-name="mark-tag"]').val();
							create(name, tag);
						}
					}
				}
			});
		});
	}

	function handleModify() {
		$('.mark-row.tag-row').tooltip(); //start tooltips
		$('#modify').on('click', function (ev) {
			var marksToModify = $('.mark-row.selected');
			if (!marksToModify.length) {
				return;
			}
			var marksTags = $('.mark-row');
			var tagparent = marksToModify.length > 1 ? undefined : $(marksToModify[0]).find('[data-name="mark-parent"]').val();
			var title = marksToModify.length > 1 ? 'Editing multiple marks parent' : 'Editing ' + $(marksToModify[0]).find('.tag-item').text() + ' name/parent';
			var modelnode = marksToModify.length > 1 ? $('.marks').find('.multi-mark-modal') : $('.marks').find('.one-mark-modal');
			var modelselector = modelnode.find('#markParent');
			var tags = [];

			modelselector.empty();
			tags.push({
				tag: '',
				name: '---NO PARENT---'
			});
			for (var i = 0; i < marksTags.length; i++) {
				var mark = $(marksTags[i]);
				if (true != mark.hasClass('selected')) {
					tags.push({
						tag: mark.find('[data-name="mark-tag"]').val(),
						name: mark.find('[data-name="mark-name"]').val()
					});
				}
			}
			addOptionsToSelect(modelselector, tags, 'tag', 'name');
			if (marksToModify.length > 1) {
				var modeltag = modelnode.find('.label-mark-tag');
				var modeltags = modelnode.find('#markTags');
				modeltags.empty();
				for (var i = 0; i < marksToModify.length; i++) {
					var mark = $(marksToModify[i]);
					modeltag.find('#markTag').attr('checked', true);
					modeltag.find('#markTag').val(mark.find('[data-name="mark-tag"]').val());
					modeltag.find('#markName').html(mark.find('[data-name="mark-name"]').val());
					modeltag.find('.tag-row').attr('title', '[TAG] ' + mark.find('[data-name="mark-tag"]').val())
					modeltags.append(modeltag.html())
				}
			} else {
				var mark = $(marksToModify[0]);
				modelnode.find('[data-name="mark-tag"]').attr('value', mark.find('[data-name="mark-tag"]').val());
				modelnode.find('[data-name="mark-name"]').attr('value', mark.find('[data-name="mark-name"]').val());
			}

			bootbox.dialog({
				title: title,
				message: modelnode.html(),
				buttons: {
					success: {
						label: "Save",
						className: "btn-primary save",
						callback: function () {
							var modal = $('.bootbox'),
								marktag = modal.find('[data-name="mark-tag"]').val(),
								markname = modal.find('[data-name="mark-name"]').val(),
								parentset = modal.find('div.form-group select').val(),
								multilotal = 0,
								selectedtags = {};
							if (marksToModify.length > 1) {
								modal.find('#markTags #markTag').each(function (idx, option) {
									option = $(option);
									selectedtags[option.val()] = true;
									multilotal++;
								})
							} else {
								selectedtags[marktag] = true;
							}

							var launched = 0;
							marksToModify.each(function (idx, tag) {
								tag = $(tag);
								if (marksToModify.length > 1) {
									var searchTag = tag.find('[data-name="mark-tag"]').val();
									if (selectedtags[searchTag]) {
										launched++;
										tag.find('[data-name="mark-parent"]').attr('value', parentset);
										if (multilotal == launched) {
											save(tag, refreshpage);
										} else {
											save(tag);
										}
									}
								} else {
									tag.find('[data-name="mark-name"]').val(markname);
									tag.find('[data-name="mark-parent"]').val(parentset);
									save(tag, refreshpage);
								}

							});
						}
					}
				}
			});

			setTimeout(function () {
				$('.bootbox [data-toggle="tooltip"]').tooltip();
				if (tagparent != '{marks.parent}' && tagparent != undefined) {
					$('.bootbox div.form-group select').val(tagparent);
				}
			}, 500);
		});
	}

	function handleDeleteSelected() {
		$('#deleteSelected').on('click', function () {
			var marksToDelete = $('.mark-row.selected');
			if (!marksToDelete.length) {
				return;
			}

			bootbox.confirm('Do you want to delete the selected marks? also delete from titled topics.', function (confirm) {
				if (!confirm) {
					return;
				}
				var marks = [];
				marksToDelete.each(function (index, el) {
					marks.push($(el).attr('data-tag'));
				});
				socket.emit('admin.plugins.' + socketId + '.removeMarks', {
					marks: marks
				}, function (err) {
					if (err) {
						return app.alertError(err.message);
					}
					marksToDelete.remove();
					app.alertSuccess('Marks removed!');
				});
			});
		});
	}

	function handleSearch() {
		$('#tag-search').on('input propertychange', function () {
			if (timeoutId) {
				clearTimeout(timeoutId);
				timeoutId = 0;
			}

			timeoutId = setTimeout(function () {
				socket.emit('topics.searchAndLoadmarks', {
					query: $('#mark-search').val()
				}, function (err, marks) {
					if (err) {
						return app.alertError(err.message);
					}

					infinitescroll.parseAndTranslate('admin/manage/portalmark', 'marks', {
						marks: marks
					}, function (html) {
						$('.mark-list').html(html);
						utils.makeNumbersHumanReadable(html.find('.human-readable-number'));
						timeoutId = 0;

						selectable.enable('.mark-management', '.mark-row');
					});
				});
			}, 100);
		});
	}

	function addOptionsToSelect(select, data, valuekey, labelkey) {
		for (var i = 0; i < data.length; ++i) {
			select.append('<option value=' + data[i][valuekey] + '>' + data[i][labelkey] + '</option>');
		}
	}

	function refreshpage() {
		ajaxify.go('admin/plugins/portalmark');
	}

	function save(tag, callback) {
		var data = {
			tag: tag.attr('data-tag'),
			name: tag.find('[data-name="mark-name"]').val(),
			parent: tag.find('[data-name="mark-parent"]').val()
		};
		socket.emit('admin.plugins.' + socketId + '.update', data, function (err) {
			if (err) {
				return app.alertError(err.message);
			}

			app.alertSuccess('Tag Updated!');
			if (callback) callback();
		});
	}

	function create(name, tag) {
		var data = {
			name: name,
			tag: tag
		};
		socket.emit('admin.plugins.' + socketId + '.create', data, function (err, msg) {
			if (err) {
				return app.alertError(err.message);
			}
			if (msg) {
				app.alertSuccess(msg);
			} else {
				app.alertSuccess('Mark Created!');
				refreshpage();
			}
		});
	}

	return marks;
});
