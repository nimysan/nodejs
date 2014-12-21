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

(function($) {
	$.extend({
		documentMask : function(options) {
			// 扩展参数
			var op = $.extend({
				opacity : 0.8,
				z : 10000,
				bgcolor : '#000'
			}, options);

			// 创建一个 Mask 层，追加到 document.body
			$('<div class="jquery_addmask"> </div>').appendTo(document.body).css({
				position : 'absolute',
				top : '0px',
				left : '0px',
				'z-index' : op.z,
				width : $(document).width(),
				height : $(document).height(),
				'background-color' : op.bgcolor,
				opacity : 0
			}).fadeIn('slow', function() {
				// 淡入淡出效果
				$(this).fadeTo('slow', op.opacity);
			}).click(function() {
				// 单击事件，Mask 被销毁
				$(this).fadeTo('slow', 0, function() {
					$(this).remove();
				});
			});

			return this;
		}
	});
})(jQuery);