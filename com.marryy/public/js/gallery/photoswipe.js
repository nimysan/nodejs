$(function() {
	'use strict';
	$(document).ready(function() {
		var images = $('ul#gallery_images li');
		var items = [];
		var pswpElement = document.querySelectorAll('.pswp')[0];
		images.each(function(index, li) {
			items.push({
				src : $(li).text().trim() + '!phone',
				w : 600,
				h : 500
			})
		});
		// define options (if needed)
		var options = {
			// optionName: 'option value'
			// for example:
			index : 0
		// start at first slide
		};
		// Initializes and opens PhotoSwipe
		var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
		gallery.init();
	});
});
