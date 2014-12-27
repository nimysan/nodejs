;
(function(window, $) {
	'user strict';

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
			top : picTop + 2,
			left : picLeft + 2
		}).appendTo($("#links"));
		oDiv.data('rel', obj);

	}

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
		if (id.length <= 0) {
			$.ajax({
				url : '/gallery',
				dataType : 'json',
				type : 'post',
				data : {
					title : title,
					desc : desc,
					images : selectedImages,
					isPrivate : isPrivate,
					question : question,
					answer : answer,
					galleryStyle : gstyle
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
				url : '/gallery/' + id,
				dataType : 'json',
				type : 'put',
				data : {
					title : title,
					desc : desc,
					images : selectedImages,
					isPrivate : isPrivate,
					question : question,
					answer : answer,
					galleryStyle : gstyle
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

	var userPhotos = [];

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
			var space = page_info.user.imagePath;
			$.ajax({
				url : '/list/' + space,
				dataType : 'json',
			}).done(function(result) {
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
					img.appendTo(linksContainer);
				});
				flagSelected();
			});
		} else {
			flagSelected();
		}
	});

	function clearGalleryForm() {
		$('#g_form_id').val('');
		$('#g_title').val('');
		$('#g_desc').val('');
		$('#gq_desc').val('');
		$('#gq_answer').val('');
		$('#gallery_primate').bootstrapSwitch('state', true);
		$('div.imageChecked').remove(); // remove all masked.
		$('#g_style_part button').removeClass('btn-danger');
	}

	var selectedImages = [];
	function preFllGalleryForm(galleryId) {
		clearGalleryForm();
		$.ajax({
			url : '/gallery/' + galleryId,
			dataType : 'json',
			type : 'get'
		}).done(function(data) {
			$('#g_form_id').val(data._id);
			$('#g_title').val(data.title);
			$('#g_desc').val(data.desc);
			$('#gallery_primate').bootstrapSwitch('state', !data.isPrivate);
			if (data.isPrivate === true) {
				$('#gallery_question').removeClass('hide');
			} else {
				$('#gallery_question').addClass('hide');
			}

			$('#gq_desc').val(data.question);
			$('#gq_answer').val(data.answer);
			gstyle = data.galleryStyle;
			$('#g_style_part button[gstyle="' + gstyle + '"]').addClass('btn-danger');
			selectedImages = data.images;
			// $('button#g_img_selector').click()// click the button
		});
	}

	// page initialize
	function startSwitch() {
		var swi = $('#gallery_primate').bootstrapSwitch();
		$('#gallery_primate').on('switchChange.bootstrapSwitch', function() {
			var state = $(this).bootstrapSwitch('state');
			if (state + '' === 'false') {
				// show question area
				$('#gallery_question').removeClass('hide');
			} else {
				// hide question area
				$('#gallery_question').addClass('hide');
			}
		});
	}

	function confirmDelete(closeCallback) {
		$.messager.model = {
			ok : {
				text : "确认",
				classed : 'btn-danger'
			},
			cancel : {
				text : "取消",
				classed : 'btn-default'
			}
		};
		$.messager.confirm("删除相册", "你确定需要删除这个相册吗？删除之后不能恢复!", function() {
			closeCallback();
		});
	}

	function listGalleries() {
		$('#gallery_list_row').empty();
		// load all gallery
		$.ajax({
			url : '/user/' + page_info.user.loginId + '/gallery',
			dataType : 'json',
			type : 'get'
		}).done(function(data) {
			if (data && data.length > 0) {
				$('#no_gallery').remove();
				$('#gallery_list_row').empty();
				$(data).each(function(index, value) {
					if (value) {

						// fill
						// gallery
						var overview = $('<div class="thumbnail">');
						overview.attr('gallery-id', value._id);
						var coverSrc = 'http://nimysan.b0.upaiyun.com/sample1/li4J5yZUDtPg.jpg!phone'; // default
						if (value.images && value.images.length > 0) {
							coverSrc = value.images[0] + '!phone';
						}
						var img = $('<img src="' + coverSrc + '" alt="...">').appendTo(overview);
						var caption = $('<div class="caption">');
						caption.appendTo(overview);
						var opertors = $('<p>');
						var deleteButton = $('<a href="#" class="btn btn-danger gallery-button" role="button">删除</a>').attr('gallery_id', value._id);
						deleteButton.appendTo(opertors);
						$(deleteButton).click(function() {
							var _this = this;
							confirmDelete(function() {
								$(_this).parents('div.thumbnail').each(function() {
									var galleryId = $(this).attr('gallery-id');
									if (typeof galleryId === 'string') {
										$.ajax({
											url : '/gallery/' + galleryId,
											dataType : 'json',
											type : 'delete'
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
						var edit = $('<a href="#" class="btn btn-primary gallery-button" role="button">编辑</a>').attr('gallery_id', value._id);
						edit.appendTo(opertors);
						$(edit).click(function() {
							var galleryId = $(this).attr('gallery_id');
							preFllGalleryForm(galleryId);
						});

						var preview = $('<a href="#" class="btn btn-info gallery-button gallery-preview" role="button">查看效果</a>');
						$(preview).click(function() {
							window.open(window.location.origin + '/gallery/' + value._id, '_blank');
						});
						preview.appendTo(opertors);

						opertors.appendTo(caption);

						$('<h3>').text(value.title).appendTo(caption);
						$('<p>').text(value.desc).appendTo(caption);

						var layout = $('<div>').addClass('col-md-4').addClass('col-xs-12');
						layout.append(overview);
						$('#gallery_list_row').append(layout);
					}
				});
			} else {
				$('<h2 id="no_gallery">你还没有任何相册</h2>').appendTo($('#gallery_list'));
			}
		});
	}
	// -----------------------------
	function initUserInfoForm() {
		$('#user_info_part').yt({
			submitText : '提交',
			url : '/user/' + page_info.user.loginId,
			method : 'put',
			data : page_info.user,
			doneFn : function() {
				$.fn.yt.tooltip({
					'messageType' : 'success',
					msg : '用户信息更改成功.'
				});
			},
			forms : [ {
				type : 'text',
				placeHolder : '用户名字，当你登录的时候显示的名字',
				id : 'displayName'
			}, {
				type : 'text',
				placeHolder : '电子邮件地址，用户发送信息以及重置密码',
				id : 'email'
			}, {
				type : 'text',
				placeHolder : '最好填写手机号码，非必需',
				id : 'phone'
			}, {
				type : 'text',
				placeHolder : '微信号。 用于我们向你推送一些优惠和活动信息',
				id : 'wechat'
			}, {
				type : 'textarea',
				placeHolder : '你的个人详细描述',
				id : 'desc'
			} ]
		});
	}

	$('#g_style_selector').click(function() {
		$('#g_style_part').modal('show');
	});

	var gstyle = 'photoswipe';
	$('#g_style_part button').click(function() {
		$('#g_style_part button').removeClass('btn-danger');
		$(this).addClass('btn-danger');
		gstyle = $(this).attr('gstyle');
		$('#g_style_part').modal('hide');
	});

	$(document).ready(function() {
		initUserInfoForm();
		startSwitch();
		listGalleries();
	});
})(window, jQuery);