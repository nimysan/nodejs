$(function() {
	'use strict';

	var openPSWP = function(items) {
		var pswpElement = $('.pswp').get(0);
		// define options (if needed)
		var options = {
			// optionName: 'option value'
			// for example:
			index : 0,
			history : false,
			escKey : false,
			focus : true,
			pinchToClose : true
		// start at first slide
		};
		// Initializes and opens PhotoSwipe
		var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
		gallery.init();
		window.pswp = gallery;
	}

	window.updateProgressBar = function(progress) {
		var bar = $('#gallery_progressbar div[role="progressbar"]');
		bar.attr('aria-valuenow', progress).css('width', progress + '%').text(progress + '%').attr('aria-valuemax', '100');
	}

	$(document).ready(function() {
		var images = $('ul#gallery_images li');
		var items = [];
		var viewport = getViewportSize();
		var phoneVersionWidth = VERSIONS[getPhotoVersion()];
		var photoWall = $('.photo-wall');
		var ajaxRequests = $(document).queue('ajaxRequests');
		var progress = 0;
		var progressPart = Math.round(1 / images.size() * 100);
		$(images).each(function(index, li) {
			$(document).queue('ajaxRequests', function() {
				$.ajax({
					url : $.trim($(li).text()) + '!exif',
					dataType : 'json',
					type : 'get'
				}).done(function(data) {
					var imgItem = {
						src : $(li).text().trim() + '!phone',
						w : phoneVersionWidth,
						h : data.height * (phoneVersionWidth / data.width)
					};
					items.push(imgItem);
					// if (index < 8) {
					// var img = $('<img>').addClass('pic').addClass('pic' +
					// index);
					// img.css('width', imgItem.w * 0.3).css('height', imgItem.h
					// * 0.3);
					// img.prop('src', imgItem.src);
					// photoWall.append(img);
					// $(img).click(function() {
					// console.log('img click');
					// openPSWP(items);
					// });
					// }
					progress = progress + progressPart;
					updateProgressBar(progress);
					$(document).dequeue("ajaxRequests");
				});
			});
		});

		$(document).queue('ajaxRequests', function() {
			progress = 100;
			updateProgressBar(progress);
			openPSWP(items);
		}); // done function

		// kick off
		$(document).dequeue('ajaxRequests');
	});
});
