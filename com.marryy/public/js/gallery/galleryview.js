$(function() {
	'use strict';

	// function
	$(document).ready(function() {
		$('#gallery_view').galleryView({
			frame_width : 42,
			frame_height : 42,
			frame_gap : 8,
			pan_images : true,
			show_filmstrip_nav : true,
			show_infobar : false,
			panel_width: 1024,
			panel_height: 600
		});
	});

});