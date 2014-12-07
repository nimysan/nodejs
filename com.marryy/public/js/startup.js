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
	var space = $('li.metadata_base_path').text().trim();
	if ('' === space) {
		space = 'test'; // default one
	}
	$.ajax({
		url : '/list/' + space,
		dataType : 'json',
	}).done(
			function(result) {
				var linksContainer = $('#links'), baseUrl;
				// Add the demo images as links with thumbnails to the page:
				$.each(result, function(index, photo) {
					$('<a/>').append(
							$('<img>').css('width', '100px').css('height',
									'auto').prop('src', photo)).prop('href',
							photo).prop('title', photo.title).attr(
							'data-gallery', '').appendTo(linksContainer);
				});
			});

});
