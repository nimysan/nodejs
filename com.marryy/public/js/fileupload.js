/**
 * Depends on http://www.dropzonejs.com/
 */
$(function() {
	'use strict';

	var config = {
		api : 'http://v0.api.upyun.com/',
		bucket : 'nimysan',
	};

	$(document).ready(function() {
		$('#submit2').click(function() {
			var file = document.getElementById('file2').files[0];
			if (!file) {
				console.log('no file is selected');
				return;
			}
			// 计算 policy 和 signature 所需的参数
			// 详情见： http://docs.upyun.com/api/form_api/#表单API接口简介
			var options = {
				bucket : config.bucket,
				expiration : Math.floor(new Date().getTime() / 1000) + 86400,
				'save-key' : '/test/' + file.name
			};
			var policy = window.btoa(JSON.stringify(options));
			$.ajax({
				url : '/admin/upyunsign',
				dataType : 'json',
				type : 'get',
				data : {
					policy : policy
				}
			}).done(function(result) {
				if (result.sign) {
					var signature = result.sign;
					var data = new FormData();
					data.append('policy', policy);
					data.append('signature', signature);
					data.append('file', file);
					$.ajax({
						type : 'POST',
						url : config.api + options.bucket,
						data : data,
						/**
						 * 必须false才会自动加上正确的Content-Type
						 */
						contentType : false,
						/**
						 * 必须false才会避开jQuery对 formdata 的默认处理 XMLHttpRequest会对
						 * formdata 进行正确的处理
						 */
						processData : false
					}).then(function() {
						console.log('upload file successfully!');
					}, function() {
						// failCal
					});

				}
			});
		});
	});

});
