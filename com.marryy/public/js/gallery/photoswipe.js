$(function() {
	'use strict';
	$(document).ready(function() {
		var images = $('ul#gallery_images li');
		var items = [];
		var pswpElement = $('.pswp').get(0);

		var phoneVersionWidth = VERSIONS[getPhotoVersion()];
		var photoWall = $('.photo-wall');
		var ajaxRequests = $(document).queue('ajaxRequests');
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
					if (index < 8) {
						var img = $('<img>').addClass('pic').addClass('pic' + index);
						img.css('width', imgItem.w * 0.3).css('height', imgItem.h * 0.3);
						img.prop('src', imgItem.src);
						photoWall.append(img);
						$(img).click(function() {
							pswp.init();
						});
					}
					$(document).dequeue("ajaxRequests");
				});
			});
		});

		$(document).queue('ajaxRequests', function() {
			console.log(items);
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
			// gallery.init();
			window.pswp = gallery;
		}); // done function

		// kick off
		$(document).dequeue('ajaxRequests');
	});
});
