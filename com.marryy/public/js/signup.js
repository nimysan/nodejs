(function(window, $) {
	'use strict';
	function initSignupForm() {
		// page initialize
		$('#user_signup_form').yt({
			submitText : '提交注册',
			url : '/admin/signup',
			method : 'post',
			doneFn : function(data) {
				showInfo('用户注册成功，请登录');
			},
			forms : [ {
				type : 'text',
				placeHolder : '请选定用户名字',
				id : 'username'
			}, {
				type : 'password',
				placeHolder : '请给出用户密码',
				id : 'password'
			}, {
				type : 'password',
				placeHolder : '请再次输入用户密码以确保你输入的的密码是你想要的',
				id : 'password2'
			}  ]
		});
	}
	// start to run it
	$(document).ready(function() {
		initSignupForm();
	});

})(window, jQuery);