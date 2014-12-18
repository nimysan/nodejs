/**
 * Depends on http://www.dropzonejs.com/
 */
$(function() {
	'use strict';
	var config = {
		api : 'http://v0.api.upyun.com/',
		bucket : 'nimysan',
	};
	// Disable auto discover for all elements:
	$(document).ready(function() {
		var upyunDropzone = null;
		// http://www.dropzonejs.com/
		Dropzone.options.upyunDropzone = {
			paramName : "file",
			method : "post",
			action : config.api + config.bucket,
			maxFilesize : 10, // MB
			parallelUploads : 100, // one time you can upload 100 files
			autoProcessQueue : false,
			addRemoveLinks : true,
			fallback : function() {
				alert('你的浏览器不支持文件上传。 请专用chrome/firefox或升级IE到10以上版本。');
			},
			// only allow images
			acceptedFiles : 'image/*',
			// event listener
			init : function() {
				window.upyunDropzone = this;
				this.on("addedfile", function(file) {
					// console.log("Added file." + file.name);
				});

				this.on("sending", function(file, xhr, formData) {
					var options = {
						bucket : config.bucket,
						expiration : Math.floor(new Date().getTime() / 1000) + 86400,
						'save-key' : 'test/' + file.name
					};
					var policy = window.btoa(JSON.stringify(options));
					formData.append('policy', policy);
					// force to get the signature from back-end service
					$.ajax({
						url : '/admin/upyunsign',
						dataType : 'json',
						type : 'get',
						data : {
							policy : policy
						},
						async : false
					}).done(function(result) {
						formData.append('signature', result.sign);
					});
				});
			},
			// translate
			dictDefaultMessage : ' 拖动文件到这里上传',
			dictFallbackMessage : '你的浏览器不支持拖动文件上传',
			dictFallbackText : 'Fallback text',
			dictInvalidFileType : '不支持的文件类型',
			dictFileTooBig : '文件太大了，单个图片最多支持10M',
			dictResponseError : '文件上传错误，服务器有一些问题。请联系管理员或稍后重新试',
			dictCancelUpload : '取消',
			dictCancelUploadConfirmation : '确定取消吗？',
			dictRemoveFile : '删除',
			dictMaxFilesExceeded : '一次上传太多了。'
		};

		// page behavior
		$('#uploadButton').click(function() {
			window.upyunDropzone.processQueue();
		});
	});

});
