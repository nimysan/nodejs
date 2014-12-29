(function(window, $) {
	'use strict';

	$('#u_login_name').change(function() {
		$('#u_image_path').val($(this).val());
	});

	$('#u_upload_files').click(function() {
		var imagePath = $('#u_image_path').val();
		if (imagePath && imagePath.trim().length > 0) {
			$('#file_upload_part').modal('show');
		} else {
			showError('请先选择一个用户，而且这个用户的图像路径必须是给定了的');
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
					roles : [ (isCreateManager ? 'manager' : 'customer') ],
					studios : [ studio_id ]
				}
			}).done(function(result) {
				if (result.user) {
					showInfo('更新用户信息成功');
					cleanUserForm();
				} else {
					showError(result.err);
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
					roles : [ (isCreateManager ? 'manager' : 'customer') ],
					studios : [ studio_id ]
				}
			}).done(function(result) {
				if (result.user) {
					showInfo('新用户创建成功');
					cleanUserForm();
				} else {
					showError(result.err);
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
		showLoading();
		$.ajax({
			url : url,
			dataType : 'json',
			type : method,
			data : data
		}).done(function(result) {
			if (result.err) {
				showError(result.err);
			} else {
				showInfo('影楼信息创建或更新成功');
			}
		}).always(function() {
			offLoading();
		});
	});

	function initUserUpdateForm() {
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
	}

	// start to run it
	$(document).ready(function() {
		initUserUpdateForm();
	});

})(window, jQuery);