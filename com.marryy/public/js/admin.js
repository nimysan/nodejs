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
			loginId: {
				required: '用户名是必需填的',
				pattern: '用戶名只能包含  a-z, A-Z, 0-9 的数字或者下划线组成，最多18个字符'
			},
			mobile: {
				required: '用户手机号码是必需填的，我们会用手机号码后六位作为默认的用户登录密码',
				pattern: '你填写的手机号码格式不正确。请填写符合格式的中国手机号码'
			},
			email: {
				pattern: '请填写正确的电子邮件格式'
			}
		},
		valid: function() {
			submitUserFrom();
		},
		invalid: function() {}
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
		json.roles = [isCreateManager ? 'manager' : 'customer'];
		var user_id = json._id;
		showLoading();
		if (user_id && user_id.length > 0) {
			// update
			$.ajax({
				url: '/admin/user/' + json.loginId,
				dataType: 'json',
				type: 'put',
				data: json
			}).done(function(result) {
				offLoading();
				if (result.user) {
					openWarning('用户管理', '更新用户信息成功');
					$('#user_edit_form').modal('hide');
					cleanUserForm();
				} else {
					openWarning('用户管理', result.err);
				}
			}).always(function() {
				offLoading();
				
			});
		} else {
			// create
			$.ajax({
				url: '/admin/user/' + json.loginId,
				dataType: 'json',
				type: 'post',
				data: json
			}).done(function(result) {
				if (result.user) {
					openWarning('用户管理', '用户创建成功');
					cleanUserForm();
					$('#user_edit_form').modal('hide');
				} else {
					openWarning('用户管理', result.err);
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
			$('#u_create').text('提交');
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
	$('#add_new_user').click(function() {
		$('#user_edit_form').modal('show');
		$('form#user_form').find('input#loginId').attr('disabled', false);
		cleanUserForm();
	});
	$('button.edit-user-button').click(function() {
		var id = $(this).attr('data-id');
		cleanUserForm();
		showLoading();
		$.ajax({
			url: '/user/' + id,
			dataType: 'json',
			type: 'get'
		}).done(function(result) {
			$('#user_edit_form').modal('show');
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
	$('button.delete-user-button').click(function() {
		var id = $(this).attr('data-id');
		BootstrapDialog.show({
			title: '雅潼万象',
			message: '你确定要删除这个用户吗？',
			buttons: [{
				label: '取消',
				action: function(dialog) {
					dialog.close();
				}
			}, {
				label: '确认',
				cssClass: 'btn-warning',
				action: function(dialog) {
					showLoading();
					$.ajax({
						url: '/user/' + id,
						dataType: 'json',
						type: 'delete'
					}).done(function(result) {
						if (result.err) {
							showError(result.err);
						} else {
							showInfo("删除成功！");
						}
					}).always(function() {
						offLoading();
					});
					dialog.close();
				}
			}]
		});

	});

	// stuido
	$('#studio_submit').click(function() {
		var form = $('#studio_form');
		var data = {};
		form.find('input,textarea').each(function(index, input) {
			var $i = $(input);
			data[$i.attr('id')] = $.trim($i.val());
		});
		var studioId = form.data('_id');
		var method = studioId == null ? 'post' : 'put';
		var url = studioId == null ? '/studio' : '/studio/' + studioId;
		showLoading();
		$.ajax({
			url: url,
			dataType: 'json',
			type: method,
			data: data
		}).done(function(result) {
			$('#studio_edit_form').modal('hide');
			if (result.err) {
				showError(result.err);
			} else {
				loadStudios();
				showInfo('影楼信息创建或更新成功');
			}
		}).always(function() {
			offLoading();
		});
	});

	function clearStudioForm() {
		$('#studio_edit_form').find('input,textarea,checkbox').val('');
		$('form#studio_form').data('_id', null);
	}

	function preloadStudioForm(studioId) {

		showLoading();
		$.ajax({
			url: '/studio/' + studioId,
			dataType: 'json',
			contentType: 'json',
			type: 'get'
		}).done(function(result) {
			$('#studio_edit_form').modal('show');
			$('form#studio_form').find('#u_create').text('提交');
			if (result.err) {
				showError(result.err);
			} else {
				offLoading();
				$('#studio_edit_form').modal('show');
				// login Id is not allowed to be changed
				//$('form#studio_form').find('input#loginId').attr('disabled', true);
				$('form#studio_form').find('input,checkbox,textarea,button,select').each(function(index, ele) {
					var attr = $(ele).attr('id');
					$(ele).val(result.studio[attr] || '');
				});
				$('form#studio_form').data('_id', studioId);
			}
		}).always(function() {
			offLoading();
		});
	}


	function renderStudioTable(table, data) {
		var tbody = $(table).find('tbody');
		tbody.empty();
		var rows = $(table).find('th[yt-attr]');
		for (var i = 0; i < data.length; i++) {
			var rowData = data[i];
			var tr = $('<tr>');
			for (var j = 0; j < rows.size(); j++) {
				var attr = $(rows.get(j)).attr('yt-attr');
				var td = null;
				if ('name' == attr) {
					td = $('<td>').html('<a target="_blank" href="/studio/' + rowData._id + '">' + rowData[attr] + '</a>');
				} else {
					td = $('<td>').text(rowData[attr]);
				}
				td.appendTo(tr);
			}
			tr.data('rowId', rowData._id);
			var buttonBar = $('<td>');
			var deleteButton = $('<button class="btn btn-danger btn-sm yt-table-button">删除</btn>');
			deleteButton.appendTo(buttonBar);
			deleteButton.data('_id', rowData._id);
			deleteButton.click(function() {
				var _button = this;
				BootstrapDialog.show({
					title: '雅潼万象',
					message: '你确定需要删除吗？',
					buttons: [{
						label: '取消',
						action: function(dialog) {
							dialog.close();
						}
					}, {
						label: '确认',
						cssClass: 'btn-warning',
						action: function(dialog) {
							dialog.close();
							$.ajax({
								url: '/studio/' + $(_button).data('_id'),
								type: 'delete'
							}).done(function() {
								tr.remove();
								offLoading();
								showInfo('删除成功！');
							}).always(function() {
								offLoading();
							});
						}
					}]
				});
			});
			var editButton = $('<button class="btn btn-info btn-sm yt-table-button">编辑</btn>');
			editButton.data('_id', rowData._id);
			editButton.appendTo(buttonBar);
			editButton.click(function() {
				var studioId = $(this).data('_id');
				clearStudioForm();
				preloadStudioForm(studioId);
			});
			buttonBar.appendTo(tr);
			tr.appendTo(tbody);
		}
		//tbody.appendTo(table);
	}

	function loadStudios() {
		$.ajax({
			url: '/user/' + page_info.user.loginId + '/studios',
			dataType: 'json',
			type: 'get'
		}).done(function(result) {
			offLoading();
			if (result && result.err) {
				showError(err);
			} else {
				//render table
				renderStudioTable($('#studio_grid'), result);
			}
		}).always(function() {
			offLoading();
		});
	}

	function initUserUpdateForm() {
		// page initialize
		$('#user_password_form').yt({
			submitText: '提交',
			url: '/user/password',
			method: 'put',
			doneFn: function() {
				$.fn.yt.tooltip({
					'messageType': 'success',
					msg: '密码修改成功'
				});
			},
			preSubmitFn: function(ele) {
				var password = $(ele).find('[data-id="password"]');
				if ($load.trim(password) == '') {
					if ($.trim(password.val()) != $.trim(password2.val())) {
						showError('你没有输入密码！');
						return false;
					}
				}
				var password2 = $(ele).find('[data-id="password2"]');
				if ($.trim(password.val()) != $.trim(password2.val())) {
					showError('你两次输入的密码不一致');
					return false;
				}
				return true;
			},
			forms: [{
				type: 'text',
				placeHolder: '用户名',
				id: 'loginId',
				label: '用户名'
			}, {
				type: 'password',
				placeHolder: '请输入新密码',
				id: 'password',
				label: '新密码'
			}, {
				type: 'password',
				placeHolder: '请确认你输入的新密码跟上次的密码一致',
				id: 'password2',
				label: '确认新密码'
			}]
		});
	}
	$('#add_new_studio').click(function() {
		clearStudioForm();
		$('#studio_edit_form').modal('show');
		$('form#studio_form').find('#u_create').text('提交');
	});
	// start to run it
	$(document).ready(function() {
		initUserUpdateForm();

		// studio from page events
		$('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
			if ($(e.target).attr('href') === '#tab_studiomanager') {
				loadStudios();
			} // newly activated tab

			e.relatedTarget // previous active tab
		});
	});

})(window, jQuery);