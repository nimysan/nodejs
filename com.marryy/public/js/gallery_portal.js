$(function() {
	'use strict';

	jQuery(function($) {
		var lastHeight = 0, lastWidth = 0, curWidth = 0, curHeight = 0, $frame = $('iframe:eq(0)');
		setInterval(function() {
			curHeight = $frame.contents().find('body').height();
			curWidth = $frame.contents().find('body').width();
			if (curHeight != lastHeight) {
				$frame.css('height', (lastHeight = curHeight) + 'px');
			}
			// if (curWidth != lastWidth) {
			// $frame.css('width', (lastWidth = curWidth) + 'px');
			// }
		}, 500);
	});
});