;
(function(window, $) {
	'use strict';

	function generateQrCode() {
		$('img.qr').each(function(index, ele) {
			$(ele).prop('src', 'http://qr.liantu.com/api.php?bg=000000&fg=ffffff&m=5&text=' + 'http://' + window.location.hostname +'/'+ $(ele).attr('gallery_id'));
		});
	};
	// start to run it
	$(document).ready(function() {
		generateQrCode();
	});

})(window, jQuery);