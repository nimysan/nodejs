(function(window, $) {
	'use strict';

	$('#u_login_name').change(function() {
		$('#u_image_path').val($(this).val());
	});

	$('button#u_upload_files').click(function() {
		var imagePath = $(this).attr('imagePath');
		$('#file_upload_part').modal('show');
	});
	$('#u_create, #u_create_manager').click(function() {
		var isCreateManager = $(this).attr('id') === 'u_create_manager';
		var name = $('#u_login_name').val();
		var user_id = $('#g_form_id').attr('user_id');
		var studio_id = $('#u_stuido').val();
		showLoading();
		if (user_id && user_id.length > 0) {
			// update
			$.ajax({
				url : '/admin/user/' + name,
				dataType : 'json',
				type : 'put',
				data : {
					imagePath : $('#u_image_path').val(),
					roles : [ (isCreateManager ? 'manager' : 'customer') ],
					fromStudio : studio_id
				}
			}).done(function(result) {
				offLoading();
				if (result.user) {
					showInfo('更新用户信息成功');
					cleanUserForm();
				} else {
					showError(result.err);
				}
			}).always(function() {
				offLoading();
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
					fromStudio : studio_id
				}
			}).done(function(result) {
				if (result.user) {
					showInfo('新用户创建成功');
					cleanUserForm();
				} else {
					showError(result.err);
				}
			}).always(function() {
				offLoading();
			});
		}
	});

	function cleanUserForm() {
		$('#u_login_name').val('');
		$('#u_image_path').val('');
		// studio_id
		$('select#u_stuido').val('');
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
			$('select#u_stuido').val($(this).find('td.u-studio').attr('studio_id'));
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

	function initStudioForm() {
		$('#studio_table_form').yt_table({
			dataLoadUrl : '/user/supervisor/studios',
			table : [ {
				th : '影楼名称',
				attr : 'name'
			}, {
				th : '影楼网址',
				attr : 'link'
			}, {
				th : '简介',
				attr : 'desc'
			}, {
				th : '地址',
				attr : 'address'
			}, {
				th : '影楼联系人',
				attr : 'contactName'
			}, {
				th : '影楼联系电话',
				attr : 'contactDeskPhone'
			}, {
				th : '影楼联系楼手机号码',
				attr : 'contactMobilePhone'
			} ],
			form_options : {
				submitText : '提交',
				urlFn : function(data) {
					if (data && data._id != '') {
						return '/studio/' + data._id;
					} else {
						return '/studio';
					}
				},
				method : 'put',
				doneFn : function() {
					$.fn.yt.tooltip({
						'messageType' : 'success',
						msg : '影楼信息更新成功'
					});
				},
				forms : [ {
					type : 'text',
					placeHolder : '影楼名称',
					id : 'name'
				}, {
					type : 'textarea',
					placeHolder : '影楼简介',
					id : 'desc'
				}, {
					type : 'text',
					placeHolder : '影楼网址（如果有）',
					id : 'link'
				}, {
					type : 'text',
					placeHolder : '影楼地址（如果有）',
					id : 'address'
				}, {
					type : 'text',
					placeHolder : '影楼联系人',
					id : 'contactName'
				}, {
					type : 'text',
					placeHolder : '影楼联系电话',
					id : 'contactDeskPhone'
				}, {
					type : 'text',
					placeHolder : '影楼联系楼手机号码',
					id : 'contactMobilePhone'
				} ]
			}
		});
	}

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

		// studio from page events
		$('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
			if ($(e.target).attr('href') === '#tab_studiomanager') {
				initStudioForm();
			} // newly activated tab

			e.relatedTarget // previous active tab
		});
	});

})(window, jQuery);