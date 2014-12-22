var VERSIONS = {
	desk : 1024,
	phone : 852
};

function getViewportSize() {
	var viewportwidth;
	var viewportheight;

	// the more standards compliant browsers (mozilla/netscape/opera/IE7) use
	// window.innerWidth and window.innerHeight

	if (typeof window.innerWidth != 'undefined') {
		viewportwidth = window.innerWidth, viewportheight = window.innerHeight
	}

	// IE6 in standards compliant mode (i.e. with a valid doctype as the first
	// line in the document)

	else if (typeof document.documentElement != 'undefined' && typeof document.documentElement.clientWidth != 'undefined' && document.documentElement.clientWidth != 0) {
		viewportwidth = document.documentElement.clientWidth, viewportheight = document.documentElement.clientHeight
	}

	// older versions of IE

	else {
		viewportwidth = document.getElementsByTagName('body')[0].clientWidth, viewportheight = document.getElementsByTagName('body')[0].clientHeight
	}
	return {
		w : viewportwidth,
		h : viewportheight
	};
}

function getPhotoVersion() {
	var viewportSize = getViewportSize();
	if (viewportSize.w >= VERSIONS.desk) {
		return 'desk';
	} else {
		return 'phone';
	}
}
/** function definition * */
function registerAnswerSubmit() {
	$('#submit_answer').click(function() {
		var galleryId = $('#galleryId').val();
		var answer = $.trim($('#gallery_answer').val());
		$.ajax({
			url : '/gallery/verify/' + galleryId,
			dataType : 'json',
			type : 'post',
			data : {
				answer : answer
			}
		}).done(function(data) {
			if (data.err && data.err != '') {
				showPageMessage(data.err, false);
			} else {
				// show gallery
				showPageMessage('回答正确，请您欣赏相册', true);
				window.location.href = window.location.origin + '/gallery/' + galleryId;
			}
		});
	});
};

function showPageMessage(message, trueOrFalse) {
	if (trueOrFalse) {
		$('#message').text(message).removeClass('hide').removeClass('alert-danger').addClass('alert-success');
	} else {
		$('#message').text(message).removeClass('hide').addClass('alert-danger');
	}
}
(function($) {
	$(document).ready(function() {
		$('#carousel-banner').carousel({
			interval : 2000
		});
	});
})(jQuery);