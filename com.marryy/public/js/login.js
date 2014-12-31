(function(window, $) {
	'use strict';
	function initLoginForm() {
		// page initialize
		$('#user_login_form').yt({
			submitText : '登录',
			url : '/admin/login',
			method : 'post',
			doneFn : function(data) {
				showInfo('恭喜你, 登录成功！');
				if (data && data.user && data.user.role && data.user.role == 'manager') {
					window.location.href = '/admin/user';
				} else if (data.user.loginId == 'supervisor') {
					window.location.href = '/admin/user';
				} else {
					window.location.href = '/';
				}
			},
			forms : [ {
				type : 'text',
				placeHolder : '请输入用户名',
				id : 'username'
			}, {
				type : 'password',
				placeHolder : '请输入用户密码',
				id : 'password'
			} ]
		});
	}
	// start to run it
	$(document).ready(function() {
		initLoginForm();
	});

})(window, jQuery);