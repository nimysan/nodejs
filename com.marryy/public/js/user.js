;
(function(window, $) {
	'user strict';

	function showMessage(id, message, trueOrFalse) {
		var group = $('div.form-group[atth=' + id + ']');
		if (trueOrFalse) {
			group.addClass('has-success').removeClass('has-error');
//			$('span.glyphicon', group).addClass('glyphicon-ok').removeClass(
//					'glyphicon-remove').removeClass('hide');
//			$('span.sr-only', group).removeClass('hide');
			$('#message').text(message).removeClass('hide').removeClass(
					'alert-danger').addClass('alert-success');
		} else {
			group.addClass('has-error').removeClass('has-success');
//			$('span.glyphicon', group).removeClass('glyphicon-ok').addClass(
//					'glyphicon-remove').removeClass('hide');
//			$('span.sr-only', group).removeClass('hide');
			$('#message').text(message).removeClass('hide').addClass(
					'alert-danger');
		}
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

	$('#user_password_2').change(
			function() {
				showMessage('user_password_2', '两次输入的密码必须一致', $(
						'#user_password').val() == $(this).val());
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

})(window, jQuery);