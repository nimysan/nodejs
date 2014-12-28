(function(window, $) {
	'use strict';
	function initLoginForm() {
		// page initialize
		$('#user_login_form').yt({
			submitText : '登录',
			url : '/admin/login',
			method : 'post',
			doneFn : function(data) {
				showInfo('用户注册成功，请登录');
				window.location.href = '/';
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