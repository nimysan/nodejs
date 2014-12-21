$(function() {
	'use strict';

	// function
	$(document).ready(function() {
		$('#gallery_view').galleryView({
			frame_width : 8,
			frame_height : 8,
			frame_gap : 8,
			pan_images : true,
			show_filmstrip_nav : false,
			show_infobar : false,
			panel_width: 1600,
			panel_height: 768
		});
	});

});