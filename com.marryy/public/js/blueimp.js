/*
 * Bootstrap Image Gallery JS Demo 3.0.1
 * https://github.com/blueimp/Bootstrap-Image-Gallery
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint unparam: true */
/*global blueimp, $ */

$(function() {
	'use strict';
	$(document).ready(function() {
		var images = $('ul#gallery_images li');
		var linksContainer = $('#links');
		// Add the demo images as links with thumbnails to the page:
		$.each(images, function(index, li) {
			var photo = $(li).text().trim();
			$('<a/>').append($('<img>').css('width', '80px').css('height', 'auto').prop('src', photo)).prop('href', photo).prop('title', photo.title).attr('data-gallery', '').appendTo(linksContainer);
			// $('<img>').css('width', '100px').css('height',
			// 'auto').prop('src', photo + '!100').appendTo(linksContainer);
		});
	});

});