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

function loadIndexPage (){
	var galleries = jQuery.parseJSON($('#galleries_data').val());
	if(galleries && galleries.length > 0){
		for(var i=0; i<galleries.length; i++){
			var gallery = galleries[i];
			
			if(gallery.images.length <=0){
				continue;
			}

			var ghtml = $('<div>').addClass('thumbnail').addClass('img-thumbnail-index');
			
			var glink = $('<a>').prop('href', '/gallery/'+gallery._id);
			var gimg = $('<img>').prop('src', gallery.cover+'!thumbnail');
			gimg.appendTo(glink);
			glink.appendTo(ghtml);
			var divHtml = $('<div>').addClass('caption');
			var titleH = $('<h7>'+ gallery.title +'</h7>').addClass('tile-text');
			titleH.appendTo(divHtml);

			var tagH = $('<div><p class="small">ABC</p></div>');
			tagH.appendTo(divHtml);
			divHtml.appendTo(ghtml);
			var countHtml = $('<div><code class="num">'+gallery.images.length +'</code><span style="margin-left:2px;margin-top:2px;">张</span></div>').addClass('image-counts-label');
			countHtml.appendTo(ghtml);
			var htmlContainer = null;
			if (i < 6) {
				htmlContainer = $('div#container-column-1');
			} else if (i>=6 && i <12){
				htmlContainer = $('div#container-column-2');
			} else if (i>=12 && i<18){
				htmlContainer = $('div#container-column-3');
			} else {
				htmlContainer = $('div#container-column-4');
			}

			ghtml.appendTo(htmlContainer);

		}
	}

	$("img").each(function(k,img){
			new JumpObj(img,10);
			$(img).hover(function(){this.parentNode.parentNode.className="hover thumbnail img-thumbnail-index"});
		});

}

(function($) {
	$(document).ready(function() {
		//render galleries to the index page --- 
		loadIndexPage();
		$('#carousel-banner').carousel({
			interval : 2000
		});
		$('img.qr').each(function(index, qrImg) {
			var $qrImg = $(qrImg);
			var src = 'http://qr.liantu.com/api.php?bg=ffffff&fg=000000&text=http://' + window.location.host + '/gallery/' + $qrImg.attr('gallery_id');
			$qrImg.prop('src', src);
		});

		$('button.thumbs-up').click(function() {
			var galleryId = $(this).attr('gallery_id');
			var _button = this;
			$.ajax({
				url : '/vote/gallery/' + galleryId,
				dataType : 'json',
				type : 'post'
			}).done(function(data) {
				if (data.votes && data.votes > 0) {
					$(_button).find('.up-vote-number').text(data.votes);
				}
			});

		})
	});
})(jQuery);