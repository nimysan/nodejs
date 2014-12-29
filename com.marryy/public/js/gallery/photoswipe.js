$(function() {
	'use strict';

	var openPSWP = function(items, index) {
		var ki = index;
		if (ki < 0 || ki >= items.length) {
			ki = 0;
		}
		var pswpElement = $('.pswp').get(0);
		// define options (if needed)
		var options = {
			// optionName: 'option value'
			// for example:
			index : ki,
			history : false,
			escKey : true,
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
		if (progress >= 100) {
			$('#gallery_progressbar').hide();
			$('#gallery_page_title').hide();
		}
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
					var img = $('<img>').addClass('pic').addClass('pic-default');
					img.attr('index', index);
					img.css('width', imgItem.w * 0.3).css('height', imgItem.h * 0.3);
					img.css('right', (50 * index) + 'px');
					var deg = 'rotate('+Math.round(Math.random()*30)+'deg)';
					img.css('-webkit-transform', deg);
					img.css('-moz-transform', deg);
					img.css('transform', deg);
					img.prop('src', imgItem.src);
					photoWall.append(img);
					$(img).fadeIn('normal');
					$(img).click(function() {
						var ik = $(this).attr('index');
						openPSWP(items, parseInt(ik));
					});
					progress = progress + progressPart;
					if (progress > 100) {
						progress = 100;
					}
					updateProgressBar(progress);
					$(document).dequeue("ajaxRequests");
				});
			});
		});

		$(document).queue('ajaxRequests', function() {
			progress = 100;
			updateProgressBar(progress);
			// openPSWP(items, 0);
		}); // done function

		// kick off
		$(document).dequeue('ajaxRequests');
	});
});
