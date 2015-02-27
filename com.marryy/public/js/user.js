;
(function(window, $) {
	'user strict';
	var userPhotos = [];
	var selectedImages = [];
	var gstyle = 'photoswipe';

	function addMask(obj) {
		$(obj).find('img').addClass('being-select');
		$(obj).attr('selected', 'true');
		$(obj).find('.img-selected-indicator').css('display', 'block');
	}

	function clearMask(obj) {
		$(obj).find('img').removeClass('being-select');
		$(obj).removeAttr('selected');
		$(obj).find('.img-selected-indicator').css('display', 'none');
	}

	function toogleImgMask(obj) {
		if ($(obj).attr('selected')) {
			clearMask(obj);
		} else {
			addMask(obj);
		}
	}

	function initGalleryForm() {
		$('#gallery_primate').click(function(event) {
			var checked = $(this).prop('checked');
			checked ? $('#gallery_question').removeClass('hide') : $('#gallery_question').addClass('hide');
		});

		$('#g_reset').click(function() {
			clearGalleryForm();
		});
		var marrySelect = $('#g_marry_type');
		for (var m in data_marries) {
			var option = $('<option>').text(data_marries[m] + '-' + m).val(data_marries[m]);
			option.appendTo(marrySelect);
		}
		// create or update
		$('button#g_create').click(function() {
			var title = $('#g_title').val();
			if ($.trim(title) == '') {
				//
				openWarning('创建或更新相册', '相册标题不能为空');

				return;
			}
			var desc = $('#g_desc').val();
			var id = $('#g_form_id').val();
			var isPrivate = $('#gallery_primate').prop('checked');
			var question = $('#gq_desc').val();
			var answer = $('#gq_answer').val();
			selectedImages = [];
			$('.img-be-selected[selected]').each(function() {
				selectedImages.push($(this).find('img').attr('origUrl'));
			});
			var coverImg = $('#img_cover_tagert').attr('origurl');
			if (coverImg) {
				if (selectedImages.indexOf(coverImg) < 0) {
					selectedImages.push(coverImg);
				}
			}
			if (selectedImages.length == 0) {
				//
				openWarning('创建或更新相册', '你没有选择任何图片');
				return;
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
						marryType: $('#g_marry_type').val(),
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
						cover: coverImg,
						marryType: $('#g_marry_type').val()
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
			$('.img-be-selected').each(function(index, d) {
				//clearMask(d);
				addMask(d);
			});
		});
		$('#selector_unselect_all').click(function() {
			$('.img-be-selected').each(function(index, d) {
				//clearMask(d);
				clearMask(d);
			});
			//selectedImages = [];
		});
		$('#full_screen').click(function() {
			$('.user-gallery-form').fullScreen(true);
		})
		$('button#g_img_selector').click(function() {

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
						openWarning('相册管理', '你还没有图片');
						return;
					}
					var linksContainer = $('#links');
					// Add the demo images as links with thumbnails to the page:
					userPhotos = result;
					if (userPhotos.length == 0) {
						openWarning('相册管理', '你还没有图片,请联系你的管理员帮你上传照片。待照片上传完之后你就可以过来编辑相册了！');
					}

					$.each(result, function(index, photo) {
						var photoUrl = photo + '!100'; // use thumbnail
						var img = $('<img>').css('width', '100px').css('cursor', 'pointer').css('height', 'auto').attr('origUrl', photo).prop('src', photoUrl);
						$(img).draggable({
							revert: true,
							helper: 'clone'
						});
						var div = $('<div">').addClass('img-be-selected');
						div.click(function() {
							toogleImgMask(this);
						});
						img.appendTo(div);
						var selIndicator = $('<div class="img-selected-indicator"></div>').css('display', 'none');
						selIndicator.appendTo(div);
						div.appendTo(linksContainer);
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
		$('#g_marry_type').val('');
		$('#gq_desc').val('');
		$('#gq_answer').val('');
		$('#gallery_primate').prop('checked', false);
		$('div.imageChecked').remove(); // remove all masked.
		$('#g_style_part button').removeClass('btn-danger');
		$('#img_cover_tagert').prop('src', '/img/cover_pl.png');
	}

	function flagSelected() {
		$('.img-be-selected').each(function(index, d) {
			//clearMask(d);
			clearMask(d);
		});
		if (selectedImages && selectedImages.length > 0) {
			var divs = $('.img-be-selected');
			for (var i = 0; i < selectedImages.length; i++) {
				var img = selectedImages[i];
				var png = img.substring(img.lastIndexOf('/') + 1);
				divs.each(function(index, im) {
						var url = $(im).find('img').attr('origurl');
						url = url.substring(url.lastIndexOf('/') + 1);
						if (url === png) {
							clearMask(im);
							addMask(im);
						}
					})
					//console.log(img);
			}
		}
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
			offLoading();
			$('#g_form_id').val(data._id);
			$('#g_title').val(data.title);
			$('#g_desc').val(data.desc);
			$('#g_tags').val();
			$('#g_marry_type').val(data.marryType);
			$('#gallery_primate').prop('checked', data.isPrivate);
			if (data.isPrivate === true) {
				$('#gallery_question').removeClass('hide');
			} else {
				$('#gallery_question').addClass('hide');
			}
			$('#img_cover_tagert').prop('src', data.cover + '!phone').width('260').height('auto');
			$('#g_tags').val(composeTags(data.tags));
			$('#gq_desc').val(data.question);
			$('#gq_answer').val(data.answer);
			gstyle = data.galleryStyle;
			$('#g_style_part button[gstyle="' + gstyle + '"]').addClass('btn-danger');
			selectedImages = data.images;
			// $('button#g_img_selector').click()// click the button
			flagSelected();
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
				var showUrl = origurl.substring(0, origurl.lastIndexOf('!')) + '!phone';
				//console.log(origurl);
				$(this).addClass("ui-state-highlight").prop('src', showUrl).width(260).height('auto').attr('origurl', $(event.toElement).attr('origurl'));
				addMask($('.img-be-selected img[origurl="' + origurl + '"]').parents('div.img-be-selected'));
				event.stopPropagation();
			}
		});
	}

	function addValidatePasswordForm() {
		$('form#update_password_form').validate({
			onKeyup: true,
			onSubmit: true,
			sendForm: false,
			eachValidField: function(event, status, options) {
				$(this).closest('div.form-group').addClass('has-feedback').removeClass('has-error').addClass('has-success');
				$(this).closest('div').find('span.temp').remove();
				$(this).closest('div').find('span#messages').addClass('hide');
			},
			eachInvalidField: function(event, status, options) {
				$(this).closest('div.form-group').addClass('has-feedback').addClass('has-error').removeClass('has-success');
				$(this).closest('div').append('<span class="glyphicon glyphicon-remove form-control-feedback temp" aria-hidden="true"></span>');
				$(this).closest('div').append('<span id="' + $(this).attr('id') + 'Error" class="sr-only temp">(不能为空)</span>');
				var log = '';
				var fieldDescription = options.description[$(this).attr('id')];
				if (!status.required) {
					log = fieldDescription.required;
				} else if (!status.pattern) {
					log = fieldDescription.pattern;
				} else if (!status.conditional) {
					log = fieldDescription.conditional;
				}
				$(this).closest('div').find('span#messages').removeClass('hide').html(log);
			},
			description: {
				pf_old_password: {
					required: '必须填写'
				},
				pf_new_password: {
					required: '必须填写',
					pattern: '密码格式不正确, 密码中必须包含字母、数字、特称字符，至少8个字符，最多30个字符'
				},
				pf_new_password_repeat: {
					required: '必须填写',
					pattern: '密码格式不正确, 密码中必须包含字母、数字、特称字符，至少8个字符，最多30个字符'
				}
			},
			valid: function() {
				submitPasswordUpdateForm();
			},
			invalid: function() {}
		});
	}

	function submitPasswordUpdateForm() {
		if ($('#pf_new_password').val() !== $('#pf_new_password_repeat').val()) {
			$('#pf_new_password_repeat').closest('div').find('span#messages').removeClass('hide').html('两次输入的密码不一致，重复输入');
			return false;
		} else {
			showLoading({
				'text': '密码修改请求提交中, 请耐心等候。。。'
			});
			$.ajax({
				url: '/password/update',
				dataType: 'json',
				type: 'put',
				data: {
					old_password: $('#pf_old_password').val(),
					new_password: $('#pf_new_password').val()
				}
			}).done(function(data) {
				if (data && !data.err) {
					showInfo('密码修改成功');
					//reset
					$('#pf_old_password').val('');
					$('#pf_new_password').val('');
					$('#pf_new_password_repeat').val('');

				} else {
					showError('修改密码出现错误, 未能成功修改密码')
				}
			}).always(function() {
				offLoading();
			});
		}
	}

	$(document).ready(function() {
		initUserInfoForm();
		listGalleries();
		addCoverDroppable();
		initGalleryForm();
		addValidatePasswordForm();
	});
})(window, jQuery);