$(function() {
	'use strict';

	// function
	$(document).ready(function() {
		while (true) {
			var last = $('div.ia-container>figure:last');
			var prev = last.prev();
			if (prev.size() > 0) {
				last.appendTo(prev);
			} else {
				break;
			}
		}
		// calculate the accordion width
		$('.ia-container figure').css('width', '852px');
		$('.ia-container').css('width', (($('figure').size() - 1) * 50 + 852) + 'px');
		$('.ia-container input:checked').siblings('figure').css('width', '852px');
	});

});