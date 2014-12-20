$(function() {
	'use strict';
	$(document).ready(function() {
		var images = $('ul#gallery_images li');
		var linksContainer = $('#links');
		// Add the demo images as links with thumbnails to the page:
		var thumbnails = $('ul.items-small');
		var normals = $('ul.items-big');
		$.each(images, function(index, li) {
			var photo = $(li).text().trim();

			var s_li = $('<li class="item">');
			var s_a = $('<a href="#">');
			var s_img = $('<img>').prop('src', photo + '!thumbnail');
			s_img.appendTo(s_a);
			s_a.appendTo(s_li);
			thumbnails.append(s_li);

			var b_li = $('<li class="item--big">');
			var b_a = $('<a href="#">');
			var b_figure = $('<figure>');
			var b_img = $('<img>').prop('src', photo + '!desk');
			b_img.appendTo(b_figure);
			b_figure.appendTo(b_a);
			b_a.appendTo(b_li);
			normals.append(b_li);
		});
	});

	$('#gallery-container').sGallery({
		fullScreenEnabled : true
	});

});
