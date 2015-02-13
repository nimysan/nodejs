;
(function(window, $) {
	'use strict';

	function generateQrCode() {
		$('img.qr').each(function(index, ele) {
			$(ele).prop('src', 'http://qr.liantu.com/api.php?bg=000000&fg=ffffff&m=5&text=' + 'http://' + window.location.hostname + '/gallery/' + $(ele).attr('gallery_id'));
		});
	};

	function thumailUp() {
		if (page_info && page_info.user && page_info.user.loginId) {
			$('button.thumbs-up').click(function() {
				var galleryId = $(this).attr('gallery_id');
				var _button = this;
				$.ajax({
					url: '/vote/gallery/' + galleryId,
					dataType: 'json',
					type: 'post'
				}).done(function(data) {
					if (data.votes && data.votes > 0) {
						$(_button).find('.up-vote-number').text(data.votes);
					}
				});
			})
		} else {
			$('button.thumbs-up').attr('disabled', true);
		}
	};
	// start to run it
	$(document).ready(function() {
		generateQrCode();
		thumailUp();
	});

})(window, jQuery);