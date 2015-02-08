;
(function(window, $) {
	'user strict';
	var userPhotos = [];
	var selectedImages = [];
	var gstyle = 'photoswipe';

	function toogleMask(obj) {
		var mask = $('div.imageChecked[src="' + $(obj).attr('src') + '"]');
		if (mask.size() > 0) {
			mask.remove();
		} else {
			addMask(obj);
		}
	}

	function addMask(obj) {
		var picH = $(obj).height();
		var picW = $(obj).width();
		var picTop = $(obj).position().top;
		var picLeft = $(obj).position().left;
		var oDiv = $("<div class='imageChecked'><div id='mask' class='mask'></div></div>").click(function() {
			$(this).remove();
		});
		oDiv.attr('src', $(obj).attr('src'));
		$(oDiv).css("height", picH + "px").css("width", picW + "px").css({
			top: picTop + 2,
			left: picLeft + 2
		}).appendTo($("#links"));
		oDiv.data('rel', obj);

	}

	function initGalleryForm() {
		$('#gallery_primate').click(function(event) {
			var checked = $(this).prop('checked');
			checked ? $('#gallery_question').removeClass('hide') : $('#gallery_question').addClass('hide');
		});
		// create or update
		$('button#g_create').click(function() {
			var title = $('#g_title').val();
			var desc = $('#g_desc').val();
			var id = $('#g_form_id').val();
			var isPrivate = !$('#gallery_primate').bootstrapSwitch('state');
			var question = $('#gq_desc').val();
			var answer = $('#gq_answer').val();
			selectedImages = [];
			$('.image-be-checked').each(function() {
				selectedImages.push($(this).attr('origUrl'));
			});
			var coverImg = $('#img_cover_tagert').attr('origurl');
			if (coverImg) {
				if (selectedImages.indexOf(coverImg) < 0) {
					selectedImages.push(coverImg);
				}
			}
			if (id.length <= 0) {
				$.ajax({
					url: '/gallery',
					dataType: 'json',
					type: 'post',
					data: {
						title: title,
						desc: desc,
						images: selectedImages,
						isPrivate: isPrivate,
						question: question,
						tags: toTagsArray($('#g_tags').val()),
						answer: answer,
						galleryStyle: gstyle,
						cover: coverImg
					}
				}).done(function(data) {
					clearGalleryForm();
					selectedImages = [];
					if (data == null || data.err != null) {
						showError('创建相册失败， 请重新试一下');
					} else {
						listGalleries();
						showInfo('创建相册成功，你可以刷新页面以查看你的相册');
					}
				});
			} else {
				$.ajax({
					url: '/gallery/' + id,
					dataType: 'json',
					type: 'put',
					data: {
						title: title,
						desc: desc,
						images: selectedImages,
						isPrivate: isPrivate,
						question: question,
						tags: toTagsArray($('#g_tags').val()),
						answer: answer,
						galleryStyle: gstyle,
						cover: coverImg
					}
				}).done(function(data) {
					clearGalleryForm();
					selectedImages = [];
					if (data == null || data.err != null) {
						showError('更新相册失败， 请重新试一下');
					} else {
						listGalleries();
						showInfo('更新相册成功，你可以刷新页面以查看你的相册');
					}
				});
			}

		});



		$('#selector_select_all').click(function() {
			$('img.being_select').addClass('image-be-checked');
			$('.image-be-checked').each(function() {
				selectedImages.push($(this).attr('origUrl'));
			});
		});
		$('#selector_unselect_all').click(function() {
			$('img.being_select').removeClass('image-be-checked');
			selectedImages = [];
		});

		$('button#g_img_selector').click(function() {
			function flagSelected() {
				$('.being_select').removeClass('image-be-checked');
				$(selectedImages).each(function(index, url) {
					$('.being_select[origUrl="' + url + '"]').addClass('image-be-checked');
				});
			}
			if (userPhotos.length <= 0) {
				var space = page_info.user.loginId;
				showLoading({
					'text': '正在加载你所有的照片，请稍等'
				});
				$.ajax({
					url: '/image/list/' + space,
					dataType: 'json',
				}).done(function(result) {
					if (result.err) {
						showInfo('你还没有图片');
					}
					return;
					var linksContainer = $('#links');
					// Add the demo images as links with thumbnails to the page:
					userPhotos = result;

					$.each(result, function(index, photo) {
						var photoUrl = photo + '!100'; // use thumbnail
						var img = $('<img>').addClass('being_select').css('width', '100px').css('cursor', 'pointer').css('height', 'auto').attr('origUrl', photo).prop('src', photoUrl).click(function() {
							if ($(this).hasClass('image-be-checked')) {
								$(this).removeClass('image-be-checked');
							} else {
								$(this).addClass('image-be-checked');
							}
						});
						$(img).draggable({
							revert: true,
							helper: 'clone'
						});
						img.appendTo(linksContainer);
					});
					flagSelected();
				}).always(function() {
					offLoading();
				});
			} else {
				flagSelected();
			}
		});
		$('#g_style_selector').click(function() {
			$('#g_style_part').modal('show');
		});


		$('#g_style_part button').click(function() {
			$('#g_style_part button').removeClass('btn-danger');
			$(this).addClass('btn-danger');
			gstyle = $(this).attr('gstyle');
			$('#g_style_part').modal('hide');
		});
	}

	function clearGalleryForm() {
		$('#g_form_id').val('');
		$('#g_title').val('');
		$('#g_desc').val('');
		$('#g_tags').val('');
		$('#gq_desc').val('');
		$('#gq_answer').val('');
		$('#gallery_primate').bootstrapSwitch('state', true);
		$('div.imageChecked').remove(); // remove all masked.
		$('#g_style_part button').removeClass('btn-danger');
		$('#img_cover_tagert').prop('src', '/img/cover_pl.png');
	}

	function composeTags(array) {
		var tag = '';
		if ($.isArray(array)) {
			for (var i = 0; i < array.length; i++) {
				tag = tag + ' ' + array[i];
			}
			return tag;
		} else {
			return tag;
		}
	}

	function toTagsArray(string) {
		if ($.trim(string) === '') {
			return [];
		} else {
			var tags = [];
			var ts = string.split(' ');
			for (var x = 0; x < ts.length; x++) {
				tags.push($.trim(ts[x]));
			}
			return tags;
		}
	}



	function preFllGalleryForm(galleryId) {
		clearGalleryForm();
		$.ajax({
			url: '/gallery/' + galleryId,
			dataType: 'json',
			type: 'get'
		}).done(function(data) {
			$('#g_form_id').val(data._id);
			$('#g_title').val(data.title);
			$('#g_desc').val(data.desc);
			$('#g_tags').val();
			$('#gallery_primate').bootstrapSwitch('state', !data.isPrivate);
			if (data.isPrivate === true) {
				$('#gallery_question').removeClass('hide');
			} else {
				$('#gallery_question').addClass('hide');
			}
			$('#img_cover_tagert').prop('src', data.cover + '!100').width('auto').height('auto');
			$('#g_tags').val(composeTags(data.tags));
			$('#gq_desc').val(data.question);
			$('#gq_answer').val(data.answer);
			gstyle = data.galleryStyle;
			$('#g_style_part button[gstyle="' + gstyle + '"]').addClass('btn-danger');
			selectedImages = data.images;
			// $('button#g_img_selector').click()// click the button
		}).always(function() {
			offLoading();
		});
	}

	// page initialize
	function confirmDelete(closeCallback) {
		BootstrapDialog.show({
			title: '删除相册',
			message: '你确定需要删除这个相册吗？删除之后相册的访问信息都会丢掉。如果你只是不想让人看到你的这个相册，你可以把相册设置为‘私密’. 设置为 私密 之后，只有能回答你预设的问题的人才有机会看到你的相册。 删除之后不能恢复!',
			buttons: [{
				label: '取消',
				action: function(dialog) {
					dialog.close();
				}
			}, {
				label: '确认',
				cssClass: 'btn-warning',
				action: function(dialog) {
					closeCallback();
					dialog.close();
				}
			}]
		});
	}

	function listGalleries() {
			showLoading({
				to: '#gallery_list',
				minHeight: 400
			});
			$('#gallery_list_row').empty();
			// load all gallery
			$.ajax({
				url: '/user/' + page_info.user.loginId + '/gallery',
				dataType: 'json',
				type: 'get'
			}).done(function(data) {
				offLoading();
				if (data && data.length > 0) {
					$('#no_gallery').remove();
					$('#gallery_list_row').empty();
					var container;
					$(data).each(function(index, value) {
						if (value) {
							if (index % 2 == 0) {
								container = $('<div class="row">');
								$('#gallery_list_row').append(container);
							}
							// fill
							// gallery
							var overview = $('<div class="thumbnail">');
							overview.attr('gallery-id', value._id);
							coverSrc = value.cover + '!phone';
							var img = $('<img src="' + coverSrc + '" alt="...">').appendTo(overview);
							var caption = $('<div class="caption">');
							caption.appendTo(overview);
							if (value.isPrivate === true) {
								$('<span class="glyphicon glyphicon-lock"></span').appendTo(caption);
							} else {
								// glyphicon glyphicon-heart
								$('<span class="glyphicon glyphicon-heart"></span').appendTo(caption);
							}
							if (value.meta) {
								$('<p>').text('被访问 ' + value.meta.accesses + '次').appendTo(caption); // access
							}
							// time
							var opertors = $('<p>');
							var deleteButton = $('<a href="javascript:void(0);" class="btn btn-danger btn-sm gallery-button" role="button">删除</a>').attr('gallery_id', value._id);
							deleteButton.appendTo(opertors);
							$(deleteButton).click(function() {
								var _this = this;
								confirmDelete(function() {
									$(_this).parents('div.thumbnail').each(function() {
										var galleryId = $(this).attr('gallery-id');
										if (typeof galleryId === 'string') {
											$.ajax({
												url: '/gallery/' + galleryId,
												dataType: 'json',
												type: 'delete'
											}).done(function(data) {
												if (data === null || data.err !== null) {
													// failed to delete gallery
													showError('因为某些原因，这个相册不能被删除');
												} else {
													// removed successfully
													$('div[gallery-id="' + galleryId + '"]').remove();
													showInfo('相册删除成功');
													listGalleries();
												}
											});
										}
									});
								});
							});
							var edit = $('<a href="javascript:void(0);" class="btn btn-primary btn-sm gallery-button" role="button">编辑</a>').attr('gallery_id', value._id);
							edit.appendTo(opertors);
							$(edit).click(function() {
								var galleryId = $(this).attr('gallery_id');
								showLoading({
									to: '.tab-content'
								});
								preFllGalleryForm(galleryId);
							});

							var preview = $('<a href="javascript:void(0);" class="btn btn-info btn-sm gallery-button gallery-preview" role="button">查看</a>');
							$(preview).click(function() {
								window.open(window.location.origin + '/gallery/' + value._id, '_blank');
							});
							preview.appendTo(opertors);

							opertors.appendTo(caption);

							$('<h6>').text(value.title).appendTo(padToFixLength(caption, 10));
							$('<p>').text(padToFixLength(value.desc, 10)).appendTo(caption);
							var layout = $('<div>').addClass('col-md-6').addClass('col-xs-12').addClass('col-sm-6');
							layout.append(overview);
							container.append(layout);

						}
					});
				} else {
					$('<p id="no_gallery", class="text-info">你还没有任何相册,你可以在左边编辑你的相册。如果你的图片库还没有任何图片，请联系你的婚纱店管理员或者系统管理员。</p>').appendTo($('#gallery_list'));
				}
			});
		}
		// -----------------------------
	function initUserInfoForm() {
		$('#user_info_part').yt({
			submitText: '提交',
			url: '/user/' + page_info.user.loginId,
			method: 'put',
			data: page_info.user,
			doneFn: function() {
				$.fn.yt.tooltip({
					'messageType': 'success',
					msg: '用户信息更改成功.'
				});
			},
			forms: [{
				type: 'text',
				placeHolder: '用户名字，当你登录的时候显示的名字',
				id: 'realName',
				label: '用户名'
			}, {
				type: 'text',
				placeHolder: '电子邮件地址，用户发送信息以及重置密码',
				id: 'email',
				label: '邮件'
			}, {
				type: 'text',
				placeHolder: '最好填写手机号码，非必需',
				id: 'mobile',
				label: '手机号码'
			}, {
				type: 'text',
				placeHolder: '微信号。 用于我们向你推送一些优惠和活动信息',
				id: 'wechat',
				label: '微信号'
			}, {
				type: 'textarea',
				placeHolder: '你的个人详细描述',
				id: 'desc',
				label: '更多描述'
			}]
		});
	}



	function addCoverDroppable() {
		$('#img_cover_tagert').droppable({
			drop: function(event, ui) {
				var origurl = $(event.toElement).attr('src');
				$(this).addClass("ui-state-highlight").prop('src', origurl).width($(event.toElement).width()).height($(event.toElement).height()).attr('origurl', $(event.toElement).attr('origurl'));
			}
		});
	}

	$(document).ready(function() {
		initUserInfoForm();
		listGalleries();
		addCoverDroppable();
		initGalleryForm();
	});
})(window, jQuery);