var VERSIONS = {
	desk: 1024,
	phone: 852
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
		w: viewportwidth,
		h: viewportheight
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
			url: '/gallery/verify/' + galleryId,
			dataType: 'json',
			type: 'post',
			data: {
				answer: answer
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


function renderTags(gallery, container) {
	if (gallery && gallery.tags && gallery.tags.length > 0) {
		var tagsDiv = $('<div>').addClass('tags-container');
		var tagsHtml = $('<ul>').addClass('tags');
		tagsHtml.appendTo(tagsDiv);
		for (var i = 0; i < gallery.tags.length; i++) {
			if ($.trim(gallery.tags[i]).length <= 0) {
				continue;
			}
			var tag = $('<li class="tag-container"><a class="tag-link" href="/tag/gallery/' + gallery.tags[i] + '">' + gallery.tags[i] + '</a></li>');
			tag.appendTo(tagsHtml);
		}
		tagsDiv.appendTo(container);
	}
}

function loadIndexPage() {
	var galleries = jQuery.parseJSON($('#galleries_data').val());
	if (galleries && galleries.length > 0) {
		for (var i = 0; i < galleries.length; i++) {
			var gallery = galleries[i];

			if (gallery.images.length <= 0) {
				continue;
			}

			var ghtml = $('<div>').addClass('thumbnail').addClass('img-thumbnail-index');

			var glink = $('<a>').prop('href', '/gallery/' + gallery._id);
			var gimg = $('<img>').prop('src', gallery.cover + '!thumbnail').addClass('gallery-cover');
			gimg.appendTo(glink);
			glink.appendTo(ghtml);
			var divHtml = $('<div>').addClass('caption');
			var accesses = 0;
			if (gallery.meta && gallery.meta.accesses > 0) {
				accesses = gallery.meta.accesses;
			}
			var titleH = $('<h4><span class="marryy-type"></span>' + padToFixLength(gallery.title, 10) + '</h4>');

			//var titleH = $('<h4>'+ gallery.title +'</h4>').addClass('tile-text');
			//var viewsH = $();
			titleH.appendTo(divHtml);
			//viewsH.appendTo(divHtml);

			// var tagH = $('<div><p class="small">ABC</p></div>');
			// tagH.appendTo(divHtml);
			if (gallery.marryType && gallery.marryType.length > 0) {
				var marryType = data_marry_reverts[gallery.marryType];
				var labelStyle = 'label-info';
				try {
					var mi = parseInt(gallery.marryType);
					if (mi <= 5) {
						labelStyle = 'label-info';
					} else if (mi > 5 && mi <= 10) {
						labelStyle = 'label-primary';
					} else if (mi > 10 && mi <= 15) {
						labelStyle = 'label-warning';
					} else {
						labelStyle = 'label-danger';
					}
				} catch (e) {}
				var marryTypeHtml = $('<a>').addClass('marry-type-link').prop('href', '/marry/' + gallery.marryType).html('<label class="label ' + labelStyle + '">' + marryType + '</label>');
				divHtml.append(marryTypeHtml);
			}
			divHtml.appendTo(ghtml);
			renderTags(gallery, divHtml);
			var countHtml = $('<div><code class="num">' + gallery.images.length + '</code><span style="margin-left:2px;margin-top:2px;">张</span></div>').addClass('image-counts-label');
			countHtml.appendTo(ghtml);

			//desc
			var desc = $('<div class="gallery-desc" style="display:none;"><p>' + gallery.desc + '</p></div>');
			desc.appendTo(ghtml);

			var htmlContainer = null;
			if (i < 6) {
				htmlContainer = $('div#container-column-1');
			} else if (i >= 6 && i < 12) {
				htmlContainer = $('div#container-column-2');
			} else if (i >= 12 && i < 18) {
				htmlContainer = $('div#container-column-3');
			} else {
				htmlContainer = $('div#container-column-4');
			}

			ghtml.appendTo(htmlContainer);

		}
	}

	$("img.gallery-cover").each(function(k, img) {
		new JumpObj(img, 10);
		$(img).hover(function() {
			this.parentNode.parentNode.className = "hover thumbnail img-thumbnail-index"
		});
	});

}

function initSearchBox() {

	// create a settings object
	var settings = {
		// these are required:
		suggestUrl: '/suggests/', // the URL that provides the data for the suggest
		// these are optional:
		instantVisualFeedback: 'all', // where the instant visual feedback should be shown, 'top', 'bottom', 'all', or 'none', default: 'all'
		throttleTime: 300, // the number of milliseconds before the suggest is triggered after finished input, default: 300ms
		extraHtml: undefined, // extra HTML code that is shown in each search suggest
		highlight: true, // whether matched words should be highlighted, default: true
		queryVisualizationHeadline: '', // A headline for the image visualization, default: empty
		animationSpeed: 300, // speed of the animations, default: 300ms
		enterCallback: undefined, // callback on what should happen when enter is pressed, default: undefined, meaning the link will be followed
		minChars: 3, // minimum number of characters before the suggests shows, default: 3
		maxWidth: 400 // the maximum width of the suggest box, default: as wide as the input box
	};

	// apply the settings to an input that should get the unibox
	$("#index_search_box").unibox(settings);
}

function scrollPagination() {
	$('#content').scrollPagination({
		'contentPage': 'democontent.html', // the page where you are searching for results
		'contentData': {}, // you can pass the children().size() to know where is the pagination
		'scrollTarget': $(window), // who gonna scroll? in this example, the full window
		'heightOffset': 10, // how many pixels before reaching end of the page would loading start? positives numbers only please
		'beforeLoad': function() { // before load, some function, maybe display a preloader div
			$('.loading').fadeIn();
		},
		'afterLoad': function(elementsLoaded) { // after loading, some function to animate results and hide a preloader div
			$('.loading').fadeOut();
			var i = 0;
			$(elementsLoaded).fadeInWithDelay();
			if ($('#content').children().size() > 100) { // if more than 100 results loaded stop pagination (only for test)
				$('#content').stopScrollPagination();
			}
		}
	});

	// code for fade in element by element with delay
	$.fn.fadeInWithDelay = function() {
		var delay = 0;
		return this.each(function() {
			$(this).delay(delay).animate({
				opacity: 1
			}, 200);
			delay += 100;
		});
	};
}

(function($) {
	$(document).ready(function() {
		//render galleries to the index page --- 
		loadIndexPage();
		initSearchBox();
		scrollPagination();
	});
})(jQuery);