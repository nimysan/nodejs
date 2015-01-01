(function(window, $) {
	'use strict';

	$('#u_login_name').change(function() {
		$('#u_image_path').val($(this).val());
	});

	$('button#u_upload_files').click(function() {
		var imagePath = $(this).attr('imagePath');
		$('#file_upload_part').modal('show');
	});

	$('form#user_form').validate({
		onKeyup : true,
		onSubmit : true,
		sendForm : false,
		eachValidField : function(event, status, options) {
			$(this).closest('div.form-group').addClass('has-feedback').removeClass('has-error').addClass('has-success');
			$(this).closest('div').find('span.temp').remove();
			$(this).closest('div').find('span#messages').addClass('hide');
		},
		eachInvalidField : function(event, status, options) {
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
		description : {
			loginId : {
				required : '用户名是必需填的',
				pattern : '用戶名只能包含  a-z, A-Z, 0-9 的数字或者下划线组成，最多18个字符'
			},
			mobile : {
				required : '用户手机号码是必需填的，我们会用手机号码后六位作为默认的用户登录密码',
				pattern : '你填写的手机号码格式不正确。请填写符合格式的中国手机号码'
			},
			email : {
				pattern : '请填写正确的电子邮件格式'
			}
		},
		valid : function() {
			submitUserFrom();
		},
		invalid : function() {
		}
	});

	$('#u_reset').click(function() {
		cleanUserForm();
	});

	function submitUserFrom() {
		var isCreateManager = $('form#user_form').data('is-manager') + '' == 'true';
		var json = {};
		$('form#user_form').find('input,checkbox,textarea,button,select').each(function(index, ele) {
			if ($(ele).attr('type') == 'checkbox') {
				json[$(ele).attr('id')] = $(ele).prop('checked');
			} else {
				json[$(ele).attr('id')] = $(ele).val();
			}
		});
		json.imagePath = json.loginId;
		json.roles = [ isCreateManager ? 'manager' : 'customer' ];
		console.log(json);
		var user_id = json._id;
		showLoading();
		if (user_id && user_id.length > 0) {
			// update
			$.ajax({
				url : '/admin/user/' + json.loginId,
				dataType : 'json',
				type : 'put',
				data : json
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
				url : '/admin/user/' + json.loginId,
				dataType : 'json',
				type : 'post',
				data : json
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
	}

	$('#u_create, #u_create_manager').click(function() {
		var isCreateManager = $(this).attr('id') === 'u_create_manager';
		$('form#user_form').data('is-manager', isCreateManager);
		$('form#user_form').submit();
	});

	function cleanUserForm() {
		$('form#user_form').find('input,checkbox,textarea,select,button').each(function(index, ele) {
			$(ele).val('').prop('checked', false);
		});
	}
	// user table
	$('tr.user_detail').click(function() {
		if ($(this).hasClass('active')) {
			$(this).removeClass('active');
			cleanUserForm();

		} else {
			$('tr.user_detail').removeClass('active');
			$(this).addClass('active');
			$('form#user_form').find('#u_login_name').val($(this).find('td.u-login-id').text());
			$('form#user_form').find('select#u_stuido').val($(this).find('td.u-studio').attr('studio_id'));
			// user id
			$('form#user_form').find('#g_form_id').attr('user_id', $(this).attr('user_id'));
			$('#u_create').text('更新');
			$('#u_login_name').attr('disabled', true);
		}
	});

	$('button.delete-user-button').click(function() {
		var id = $(this).attr('data-id');
		showLoading();
		$.ajax({
			url : '/user/' + id,
			dataType : 'json',
			type : 'get'
		}).done(function(result) {
			if (result.err) {
				showError(result.err);
			} else {
				// login Id is not allowed to be changed
				$('form#user_form').find('input#loginId').attr('disabled', true);
				$('form#user_form').find('input,checkbox,textarea,button,select').each(function(index, ele) {
					var attr = $(ele).attr('id');
					if (attr == 'fromStudio') {
						$(ele).val(result.user[attr] ? result.user[attr]._id : '');
					} else if (attr == 'selfManage') {
						$(ele).prop('checked', 'true' === result.user[attr]);
					} else {
						$(ele).val(result.user[attr] || '');
					}
				});
			}
		}).always(function() {
			offLoading();
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
					id : 'name',
					label : '影楼名称'
				}, {
					type : 'textarea',
					placeHolder : '影楼简介',
					id : 'desc',
					label : '影楼简介'
				}, {
					type : 'text',
					placeHolder : '影楼网址（如果有）',
					id : 'link',
					label : '影楼网址'
				}, {
					type : 'text',
					placeHolder : '影楼地址（如果有）',
					id : 'address',
					label : '影楼地址'
				}, {
					type : 'text',
					placeHolder : '影楼联系人',
					id : 'contactName',
					label : '影楼联系人'
				}, {
					type : 'text',
					placeHolder : '影楼联系电话',
					id : 'contactDeskPhone',
					label : '影楼联系电话'
				}, {
					type : 'text',
					placeHolder : '影楼联系楼手机号码',
					id : 'contactMobilePhone',
					label : '影楼联系楼手机号码'
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