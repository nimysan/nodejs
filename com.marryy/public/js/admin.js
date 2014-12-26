(function(window, $) {
	'use strict';

	function _showStatus(text, trueOrFalse) {
		$('div.form-group span').removeClass('hide');
		$('label.control-label').text(text).removeClass('hide');
		if (trueOrFalse) {
			$('div.form-group span.glyphicon').addClass('glyphicon-ok').removeClass('glyphicon-remove');
			$('div.form-group').removeClass('has-error').addClass('has-success');
		} else {
			$('div.form-group span.glyphicon').addClass('glyphicon-remove').removeClass('glyphicon-ok');
			$('div.form-group').removeClass('has-success').addClass('has-error');
		}

	}

	function showPageMessage(message, trueOrFalse) {
		if (trueOrFalse) {
			$('#message').text(message).removeClass('hide').removeClass('alert-danger').addClass('alert-success');
		} else {
			$('#message').text(message).removeClass('hide').addClass('alert-danger');
		}
	}

	$('#u_login_name').change(function() {
		$('#u_image_path').val($(this).val());
	});

	$('#u_upload_files').click(function() {
		var imagePath = $('#u_image_path').val();
		if (imagePath && imagePath.trim().length > 0) {
			$('#file_upload_part').modal('show');
		} else {
			showPageMessage('请先选择一个用户，而且这个用户的图像路径必须是给定了的', false);
		}
	});
	$('#u_create, #u_create_manager').click(function() {
		var isCreateManager = $(this).attr('id') === 'u_create_manager';
		var name = $('#u_login_name').val();
		var user_id = $('#g_form_id').attr('user_id');
		var studio_id = $('button.studio-button.active').attr('studio_id');
		var studio_val = 'ObjectId("' + studio_id + '")';
		if (user_id && user_id.length > 0) {
			// update
			$.ajax({
				url : '/admin/user/' + name,
				dataType : 'json',
				type : 'put',
				data : {
					imagePath : $('#u_image_path').val(),
					role : (isCreateManager ? 'manager' : 'customer'),
					studios : [ studio_id ]
				}
			}).done(function(result) {
				if (result.user) {
					showPageMessage('更新用户信息成功', true);
					cleanUserForm();
				}
			});
		} else {
			// create
			$.ajax({
				url : '/admin/user/' + name,
				dataType : 'json',
				type : 'post',
				data : {
					imagePath : $('#u_image_path').val(),
					role : (isCreateManager ? 'manager' : 'customer'),
					studios : [ studio_id ]
				}
			}).done(function(result) {
				if (result.user) {
					showPageMessage('新用户创建成功', true);
					cleanUserForm();
				}
			});
		}
	});

	function cleanUserForm() {
		$('#u_login_name').val('');
		$('#u_image_path').val('');
		// user id
		$('#g_form_id').attr('user_id', '');
		$('#u_create').text('创建');
		$('#u_login_name').attr('disabled', false);
	}
	// user table
	$('tr.user_detail').click(function() {
		if ($(this).hasClass('active')) {
			$(this).removeClass('active');
			cleanUserForm();

		} else {
			$('tr.user_detail').removeClass('active');
			$(this).addClass('active');
			$('#u_login_name').val($(this).find('td.u-login-id').text());
			$('#u_image_path').val($(this).find('td.u-image-path').text());
			// user id
			$('#g_form_id').attr('user_id', $(this).attr('user_id'));
			$('#u_create').text('更新');
			$('#u_login_name').attr('disabled', true);
		}
	});
	// user table

	$('#create_space').click(function() {
		var name = $('#space_name').val();
		$.ajax({
			url : '/admin/space/' + name,
			dataType : 'json',
			type : 'post'
		}).done(function(result) {
			if (result && 0 === result) {
				_showStatus('Failed to create space', false);
			} else {
				_showStatus('Create space successfully', true);
			}
		});
	});

	// stuido
	$('#studio_submit').click(function() {
		var form = $('#studio_form');
		var data = {};
		form.find('input').each(function(index, input) {
			var $i = $(input);
			data[$i.attr('id')] = $.trim($i.val());
		});
		var studioId = null;
		var method = studioId == null ? 'post' : 'put';
		var url = studioId == null ? '/studio' : '/studio/' + studioId;
		$.ajax({
			url : url,
			dataType : 'json',
			type : method,
			data : data
		}).done(function(result) {
			console.log(result);
		});
	});

	// page initialize
	$('#user_password_form').yt({
		submitText : '提交',
		url : '/user/password',
		method : 'put',
		doneFn : function() {
			$.fn.yt.tooltip({
				'messageType' : 'success',
				msg : '密码修改成功'
			});
		},
		forms : [ {
			type : 'text',
			placeHolder : 'username',
			id : 'loginId'
		}, {
			type : 'password',
			placeHolder : 'password',
			id : 'password'
		} ]
	});

})(window, jQuery);