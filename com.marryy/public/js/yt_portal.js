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

function getImageLink(imageName, imagePath) {
	if (imageName != null && imageName.indexOf('http') == 0) {
		return imageName;
	}
	return 'http://pic.marryy.com/' + imagePath + '/' + imageName;
}

function warpImageLink(gallery) {
	if (gallery && gallery._creator && gallery.images) {
		for (var i = 0; i < gallery.images.length; i++) {
			gallery.images[i] = getImageLink(gallery.images[i], gallery._creator.imagePath);
		}
	}
	if (gallery && gallery.cover) {
		gallery.cover = getImageLink(gallery.cover, gallery._creator.imagePath);
	} else {
		gallery.cover = getImageLink(gallery.images[0], gallery._creator.imagePath);
	}
}

function renderTags(gallery, container) {
	if (gallery && gallery.tags && gallery.tags.length > 0) {
		var tagsDiv = $('<div>').addClass('tags-container');
		var tagsHtml = $('<ul>').addClass('tags');
		var tagIcon = $('<li><span class="text-muted tag-container" style="font-size:12px;">标签:</span>');
		tagIcon.appendTo(tagsHtml);
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

function loadIndexPage(galleriesParam) {
	var galleries = galleriesParam;
	if (!galleries) {
		galleries = jQuery.parseJSON($('#galleries_data').val());
	}
	if (galleries == null) {
		return;
	}
	if (galleries && galleries.length > 0) {
		//var containerIndex = 1;
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
			var titleH = $('<h5><span class="marryy-type"></span>' + padToFixLength(gallery.title, 10) + '</h5>');

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

			var htmlContainer = $('div#container-column-' + containerIndex);
			if (containerIndex == 4) {
				containerIndex = 1;
			} else {
				containerIndex++;
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


function getWrappedById(wrapped, id) {
	for (var i = 0; i < wrapped.length; i++) {
		if (wrapped[i]._id == id) {
			return wrapped[i];
		}
	}
}

function _rGallery(obj) {
	warpImageLink(obj);
	var body = $('<div>').addClass('search-result-item thumbnail');
	var header = $('<h6><a href="/gallery/' + obj._id + '" target="_blank">' + obj.title + '</a>');
	var icon = ('<img style="width:24px;height:auto;display:inline;margin-right:8px;" src="/img/gallery.png"></img>');
	header.prepend(icon);
	var cover = $('<img src="' + obj.cover + '!100"></img>');
	var count = 0;
	var imgRow = $('<div>');
	if (obj.images) {
		while (count <= 4 && count < obj.images.length) {
			var image = $('<img class="img-thumbnail" src="' + obj.images[count] + '!100"></img>');
			imgRow.append(image);
			count++;
		}
	}
	var desc = $('<p>' + obj.desc + '</p>');
	body.append(header);
	body.append(imgRow);
	imgRow.append('<h7><a href="/gallery/' + obj._id + '" target="_blank">查看更多图片</a></h7>');
	body.append(desc);
	renderTags(obj, body);
	return body;
}

function _rStudio(obj) {
	var body = $('<div>').addClass('search-result-item thumbnail');
	var header = $('<h6><a href="/studio/' + obj._id + '" target="_blank">' + obj.name + '</a>');
	var icon = ('<img style="width:24px;height:auto;display:inline;margin-right:8px;" src="/img/studio.png"></img>');
	header.prepend(icon);
	// body.append(icon);
	body.append(header);
	var desc = $('<p>' + obj.desc + '</p>');
	body.append(desc);
	//renderTags(obj, body);
	return body;
}

function renderSearchResult(data, wrapped, isInitialize) {
	var docs = data.response.docs;
	var list_div = $('#search_result_list');
	if (isInitialize) {
		list_div.empty();
		currentPage = 1;
	}
	for (var i = 0; i < docs.length; i++) {
		var sdoc = docs[i];
		if ('marryy.galleries' == sdoc.ns) {
			list_div.append(_rGallery(getWrappedById(wrapped, sdoc._id)));
		} else if ('marryy.studios' == sdoc.ns) {
			list_div.append(_rStudio(getWrappedById(wrapped, sdoc._id)));
		}
	}
}

var searchKey = '';

function initSearchQuery() {
	$('#index_search_button').click(function() {
		isInSearchModel = true;
		currentPage = 0;
		var search_key = $.trim($('#index_search_box').val());
		searchKey = search_key;
		if (search_key == '' || $.trim(search_key) == '*') {
			$('.yt-warning-message').removeClass('hide').text('请输入有意义的关键字...');
		} else {
			$('.yt-warning-message').addClass('hide');
			var button = this;
			$('#search_loader').removeClass('hide');
			$(button).attr('disabled', true);
			$.ajax({
				url: '/search',
				dataType: 'json',
				//pagination
				data: {
					q: search_key,
					start: currentPage == 1 ? 0 : (currentPage * 10),
					limit: 10
				},
				type: 'get',
				contentType: 'json'
			}).done(function(data) {
				if (!data || data.err || data.result.response.numFound <= 0) {
					$('.yt-warning-message').removeClass('hide').text('查询不到任何结果');
					$('#gallery_container').removeClass('hide');
				} else if (data && data.result) {
					$('#gallery_container').addClass('hide');
					//---
					renderSearchResult(data.result, data.wrapped, true);
				}
			}).always(function() {
				$('#search_loader').addClass('hide');
				$(button).attr('disabled', false);
			});
		}
	});
}

var isInSearchModel = false; // default is not in search model

function scrollPagination() {
	$('#gallery_container').scrollPagination({
		'contentPage': function() {
			return isInSearchModel === true ? '/search?q=' + searchKey + '&start=' + (currentPage * 10 + 1) + '&limit=10' : '/list/gallery/?page=' + currentPage + '&limit=10'
		}, // the page where you are searching for results
		'contentData': {}, // you can pass the children().size() to know where is the pagination
		'scrollTarget': $(window), // who gonna scroll? in this example, the full window
		'heightOffset': 10, // how many pixels befor+'&limit=10'e reaching end of the page would loading start? positives numbers only please
		'dataType': 'json',
		'renderAppendData': function(obj, data) {
			// if (data.pageCount * 10 > data.itemCount) {
			// 	//$('#gallery_container').stopScrollPagination();
			// }
			if (isInSearchModel) {
				//render more search result
				console.log('Render more search results');
				if (data.err) {

				} else {
					renderSearchResult(data.result, data.wrapped, false);
					if ((currentPage + 1) * 10 > data.result.response.numFound) {
						$('#gallery_container').stopScrollPagination();
					} else {
						currentPage++;
					}
				}
			} else {
				if (data && data.galleries && data.galleries.length > 0) {
					loadIndexPage(data.galleries);
					currentPage = data.paginate.page;
					if (currentPage >= data.pageCount) {
						$('#gallery_container').stopScrollPagination();
					}
					currentPage++;
				}
			}
		},
		'beforeLoad': function() { // before load, some function, maybe display a preloader div
			$('.loading').fadeIn();
		},
		'afterLoad': function(elementsLoaded) { // after loading, some function to animate results and hide a preloader div
			$('.loading').fadeOut();
			// var i = 0;
			// $(elementsLoaded).fadeInWithDelay();
			// if ($('#gallery_container').children().size() > 100) { // if more than 100 results loaded stop pagination (only for test)
			// 	$('#gallery_container').stopScrollPagination();
			// }
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

var currentPage = 2;
var containerIndex = 1;
(function($) {
	$(document).ready(function() {
		//render galleries to the index page --- 
		loadIndexPage();
		initSearchBox();
		scrollPagination();
		initSearchQuery();
	});
})(jQuery);