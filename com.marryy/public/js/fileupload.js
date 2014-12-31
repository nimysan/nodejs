/**
 * Depends on http://www.dropzonejs.com/
 */
$(function() {
	'use strict';
	var config = {
		api : 'http://v0.api.upyun.com/',
		bucket : 'nimysan',
	};

	function getExistImages() {
		var images = [];
		$('td.exist-image-name').each(function(index, td) {
			images.push($.trim($(td).text()));
		});
		return images;
	}

	var imagePath = $('#meta_data_image_path').val();
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
			accept : function(file, done) {
				if (this.existImages.indexOf(file.name) >= 0) {
					done('文件已经存在了。 不需要重复上传')
				} else {
					done();
					// continue;
				}
			},
			// event listener
			init : function() {
				window.upyunDropzone = this;
				this.existImages = getExistImages();
				this.on("sending", function(file, xhr, formData) {
					var options = {
						bucket : config.bucket,
						expiration : Math.floor(new Date().getTime() / 1000) + 86400,
						'save-key' : imagePath + '/' + file.name
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

				this.on('totaluploadprogress', function(progress, sentBytes, totalBytes) {
					var pb = $('#upload_progress_bar');
					var p = Math.round(progress);
					pb.attr('aria-valuenow', p);
					pb.css('width', p + '%');
					if (progress >= 100) {
						pb.text("恭喜你，上传完毕了");
					} else {
						pb.text('正在努力上传中, 进度 %' + p);
					}
				});

				this.on('queuecomplete', function() {
					pb.text("恭喜你，上传完毕了");
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

		// reset
		$('#reseButton').click(function() {
			// will remove all files and cancel the processing files
			window.upyunDropzone.removeAllFiles(true);
		});
	});

});
