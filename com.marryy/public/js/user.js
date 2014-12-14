;
(function(window, $) {
	'user strict';

	var user = $('#metadata_user').val();
	function showMessage(id, message, trueOrFalse) {
		var group = $('div.form-group[atth=' + id + ']');
		if (trueOrFalse) {
			group.addClass('has-success').removeClass('has-error');
			// $('span.glyphicon', group).addClass('glyphicon-ok').removeClass(
			// 'glyphicon-remove').removeClass('hide');
			// $('span.sr-only', group).removeClass('hide');
		} else {
			group.addClass('has-error').removeClass('has-success');
			// $('span.glyphicon', group).removeClass('glyphicon-ok').addClass(
			// 'glyphicon-remove').removeClass('hide');
			// $('span.sr-only', group).removeClass('hide');
		}
		showPageMessage(message, trueOrFalse);
	}

	function showPageMessage(message, trueOrFalse) {
		if (trueOrFalse) {
			$('#message').text(message).removeClass('hide').removeClass('alert-danger').addClass('alert-success');
		} else {
			$('#message').text(message).removeClass('hide').addClass('alert-danger');
		}
	}

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

	function clearFromStatus() {
		showMessage('user_name', '', true);
		showMessage('user_password', '', true);
		showMessage('user_password_2', '', true);
	}

	function validate() {
		var username = $('#user_name').val().trim();
		if (username == '') {
			showMessage('user_name', '用户名不能为空', false);
			return false;
		}

		var pass = $('#user_password').val().trim();
		if (pass == '') {
			showMessage('user_password', '密码不能为空', false);
			return false;
		}

		var pass2 = $('#user_password_2').val().trim();
		if (pass != pass2) {
			showMessage('user_password_2', '两次输入的密码必须保持一致', false);
			return false;
		}
		clearFromStatus();
		return true;
	}

	function validateLoginForm() {
		var username = $('#user_name').val().trim();
		if (username == '') {
			showMessage('user_name', '用户名不能为空', false);
			return false;
		}

		var pass = $('#user_password').val().trim();
		if (pass == '') {
			showMessage('user_password', '密码不能为空', false);
			return false;
		}

		clearFromStatus();
		return true;
	}

	$('#user_password_2').change(function() {
		showMessage('user_password_2', '两次输入的密码必须一致', $('#user_password').val() == $(this).val());
	});

	$('#create_user').click(function() {
		if (validate()) {
			var username = $('#user_name').val().trim();
			var pass = $('#user_password').val().trim();
			$.ajax({
				url : '/user/signup',
				dataType : 'json',
				type : 'post',
				data : {
					username : username,
					password : pass
				}
			}).done(function(result) {
				if (result && result.error) {
					showMessage('user_name', result.error, false);
				} else {
					showMessage('user_name', '用戶注冊成功，去登录', true);
					window.location.href = '/user/login';
				}
			});
		}
	});

	$('#user_login').click(function() {
		if (validateLoginForm()) {
			var username = $('#user_name').val().trim();
			var pass = $('#user_password').val().trim();
			$.ajax({
				url : '/user/login',
				dataType : 'json',
				type : 'post',
				data : {
					username : username,
					password : pass
				}
			}).done(function(result) {
				if (result && result.error) {
					showMessage('user_name', result.error, false);
				} else {
					showMessage('user_name', '登录成功', true);
					window.location.href = '/';
				}
			});
		}
	});

	$('a#create_gallery').click(function() {
		$.ajax({
			url : '/user/seanye/gallery',
			dataType : 'json',
			type : 'head'
		});
	});

	$('button#g_create').click(function() {
		var title = $('#g_title').val();
		var desc = $('#g_desc').val();
		var images = [];
		$('.imageChecked').each(function() {
			images.push($(this).attr('src'));
		});
		$.ajax({
			url : '/user/seanye/gallery',
			dataType : 'json',
			type : 'post',
			data : {
				title : title,
				desc : desc,
				images : images
			}
		}).done(function(data) {
			if (data == null || data.err != null) {
				showPageMessage('创建相册失败， 请重新试一下', false);
			} else {
				showPageMessage('创建相册成功，你可以刷新页面以查看你的相册', true);
			}
		});
	});

	$('button#g_img_selector').click(function() {
		// modal page to select images
		$('#img_grid_modal').modal('show');
		var space = $('li.metadata_base_path').text().trim();
		if ('' === space) {
			space = 'test'; // default one
		}
		$.ajax({
			url : '/list/' + space,
			dataType : 'json',
		}).done(function(result) {
			var linksContainer = $('#links'), baseUrl;
			// Add the demo images as links with thumbnails to the page:
			$.each(result, function(index, photo) {
				$('<img>').addClass('being_select').css('width', '100px').css('cursor', 'pointer').css('height', 'auto').prop('src', photo + '!100').attr('src', photo).click(function() {
					console.log('Add mark' + $(this).attr('src'));
					toogleMask($(this));
				}).appendTo(linksContainer);
			});
		});
	});

	$(document).ready(function() {
		// load all gallery
		$.ajax({
			url : '/user/seanye/gallery',
			dataType : 'json',
			type : 'get'
		}).done(function(data) {
			if (data && data.length > 0) {
				$(data).each(function(index, value) {
					if (value) {
						// fill
						// gallery
						var overview = $('<div class="thumbnail">')
						overview.attr('gallery-id', value._id);
						var coverSrc = 'http://nimysan.b0.upaiyun.com/sample1/li4J5yZUDtPg.jpg!phone'; // default
						if (value.images && value.images.length > 0) {
							coverSrc = value.images[0] + '!phone';
						}
						var img = $('<img src="' + coverSrc + '" alt="...">').appendTo(overview);
						var caption = $('<div class="caption">');
						caption.appendTo(overview);
						$('<h3>').text(value.title).appendTo(caption);
						$('<p>').text(value.desc).appendTo(caption);
						var opertors = $('<p>');
						var deleteButton = $('<a href="#" class="btn btn-primary gallery-button" role="button">删除</a>');
						deleteButton.appendTo(opertors);
						$(deleteButton).click(function() {
							var _this = this;
							$(this).parents('div.thumbnail').each(function() {
								var galleryId = $(this).attr('gallery-id');
								if (typeof galleryId == 'string') {
									$.ajax({
										url : '/user/seanye/gallery/' + galleryId,
										dataType : 'json',
										type : 'delete'
									}).done(function(data) {
										console.log(data);
										if (data == null || data.err != null) {
											// failed to delete gallery
											showPageMessage('因为某些原因，这个相册不能被删除', false);
										} else {
											// removed successfully
											$('div[gallery-id="' + galleryId + '"]').remove();
											showPageMessage('相册删除成功', true);
										}
									});
								}
							});
						});
						var edit = $('<a href="#" class="btn btn-primary gallery-button" role="button">编辑</a>');
						edit.appendTo(opertors);

						var preview = $('<a href="#" class="btn btn-primary gallery-button gallery-preview" role="button">查看效果</a>');
						$(preview).click(function() {
							window.open(window.location.origin + '/user/' + user + '/gallery/' + value._id, '_blank');
						});
						preview.appendTo(opertors);

						opertors.appendTo(caption);
						$('#gallery_list').append(overview);
					}
				});
			} else {
				$('<h2>你还没有任何相册</h2>').appendTo($('#gallery_list'));
			}
		});
	});
})(window, jQuery);