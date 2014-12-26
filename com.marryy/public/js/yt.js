/**
 * options.fn
 * 
 * options.urlFn
 * 
 * options.url
 * 
 * options.dataType
 * 
 * options.method
 * 
 * options.doneFn
 * 
 * options.alwaysFn
 * 
 * @param $
 */
(function($) {
	// 插件的定义
	$.fn.yt = function(options) {
		var ele = $(this);
		ele.empty();
		var data = options.data || {};
		$(options.forms).each(function(index, formE) {
			var formDiv = $('<div>').addClass('form-group');
			var div = $('<div>').addClass('input-group');
			var input = null;
			if (formE.type === 'textarea') {
				input = $('<textarea data-id="' + formE.id + '", type="' + formE.type + '" class="form-control" placeholder="' + formE.placeHolder + '" aria-describedby="basic-addon1">');
			} else {
				input = $('<input data-id="' + formE.id + '", type="' + formE.type + '" class="form-control" placeholder="' + formE.placeHolder + '" aria-describedby="basic-addon1">');
			}
			input.appendTo(div);
			input.val(data[formE.id]);
			div.appendTo(formDiv);
			formDiv.appendTo(ele);
		});

		var submitButton = $('<button type="submit" class="btn btn-primary">').text(options.submitText);
		submitButton.appendTo(ele);

		$(submitButton).click(function() {
			var jsonFrom = {};
			$(ele).find('input,textarea').each(function() {
				jsonFrom[$(this).attr('data-id')] = $(this).val();
				// validate
			});
			var fn = options.fn;
			if (typeof fn == 'function') {
				fn(ele);
			} else {
				//loading plugin - http://hekigan.github.io/is-loading/
				$.ajax({
					url : options.urlFn || options.url,
					dataType : options.dataType || 'json',
					type : options.method || 'get',
					data : jsonFrom
				}).then(function() {
					$(ele).isLoading({
						text : "努力加载中"
					});
				}).done(function(result) {
					if (result && result.err) {
						if ($.isFunction(options.doneErrFn)) {
							options.doneErrFn(result);
						} else {
							$.fn.yt.tooltip({
								'messageType' : 'danger',
								msg : result.err
							});
						}
					} else {
						if ($.isFunction(options.doneFn)) {
							options.doneFn(result);
						}
					}
				}).always(function() {
					if ($.isFunction(options.alwaysFn)) {
						options.alwaysFn(arguments);
					}
					$(ele).isLoading('hide');
				});
			}
		});
	};
	// 私有函数：debugging
	function debug($obj) {
		if (window.console && window.console.log)
			window.console.log('hilight selection count: ' + $obj.size());
	}
	// 定义暴露form函数
	$.fn.yt.form = function(txt) {
		return '<strong>' + txt + '</strong>';
	};

	$.fn.yt.tooltip = function(options) {
		var _options = {};
		if (typeof options === 'string') {
			_options = $.extend($.fn.yt.defaults, {});
			_options.msg = options;
		} else {
			_options = $.extend($.fn.yt.defaults, options);

		}
		$('div.app-message').remove();
		var msg = $('<div class="app-message">').prependTo('body>.container');
		msg.attr('role', 'alert').addClass('alert').addClass('alert-' + _options.messageType).text(_options.msg);
	};
	// 插件的defaults
	$.fn.yt.defaults = {
		messageType : 'success'
	};

	$(document).ready(function() {
		var meta = $.trim($('#metadata_user').val());
		if (meta === '') {
			meta = {};
		} else {
			meta = $.parseJSON(meta);
		}

		window.page_info = {
			'user' : meta
		}
	});
	// 闭包结束
})(jQuery);
