//;String.prototype.trim = function() {
//	return this.replace(/(^\s*)|(\s*$)/g, "");
//}
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
	$.fn.yt_table = function(options) {
		var ele = $(this);
		var _options = $.extend({
			form_options : {}
		}, options);
		ele.empty();

		if (true) {
			showLoading();
			// load data part
			$.ajax({
				url : options.dataLoadUrl,
				dataType : 'json',
				type : 'get'
			}).done(function(result) {
				if (result.err) {
					$(ele).text(result.err);
				} else {
					var data = result;
					var options_table = _options.table || [];
					if (options_table.length <= 0) {
						ele.text('Please give table title configurations');
						return;
					}
					var table = $('<table>').addClass('table').addClass('table-hover').addClass('table-bordered');
					var tableThead = $('<thead>');
					var tableTitle = $('<tr>');
					for (var i = 0; i < options_table.length; i++) {
						var th_options = options_table[i];
						var td = $('<th>').text(th_options['th']);
						td.appendTo(tableTitle);
					}

					tableTitle.appendTo(tableThead);
					tableThead.appendTo(table);
					var tbody = $('<tbody>');
					for (var i = 0; i < data.length; i++) {
						var rowData = data[i];
						var tr = $('<tr>');
						for (var j = 0; j < options_table.length; j++) {
							var th_options = options_table[j];
							var td = $('<td>').text(rowData[th_options['attr']]);
							td.appendTo(tr);
						}
						tr.data('raw', rowData);
						tr.click(function() {
							// fillForm
							if (ele.form) {
								ele.form.yt({
									action : 'refresh',
									data : $(this).data('raw')
								});
							}
						});
						tr.appendTo(tbody);
					}
					tbody.appendTo(table);
					table.prependTo(ele);
				}
			}).always(function() {
				offLoading();
			});
		}
		// load data part

		// construct form element
		var formEle = $('<div>').attr('id', $(ele).attr('id') + '_form');
		formEle.yt(options.form_options);
		formEle.appendTo(ele);
		ele.form = formEle;
		// construct form element
	};

	$.fn.yt = function(opt) {
		var ele = $(this);
		var options = $.extend({}, opt);
		if ('refresh' === opt.action) {
			// only refresh data
			var data = options.data || {};
			$(ele).find('[data-id]').each(function(index, ele) {
				$(ele).val(data[$(ele).attr('data-id')]);// include _id
				// attribute
			});
		} else {
			ele.empty();
			var idHidden = $('<input data-id="_id", type="hidden">');
			idHidden.appendTo(ele);
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
			if (typeof data._id === 'string') {
				idHidden.val(data._id);
			}

			var submitButton = $('<button type="submit" class="btn btn-primary yt-form-button">').text(options.submitText);
			submitButton.appendTo(ele);
			var cleanButton = $('<button type="submit" class="btn btn-danger yt-form-button">').text('重置');
			cleanButton.click(function() {
				$(ele).find('[data-id]').val('');// clean all values
			});
			cleanButton.appendTo(ele);

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
					// loading plugin - http://hekigan.github.io/is-loading/
					var url = '';
					if ($.isFunction(options.urlFn)) {
						url = options.urlFn(jsonFrom);
					} else {
						url = options.url;
					}
					// comply with REST style
					submitButton.addClass('disabled');
					showLoading({
						to : ele
					});
					$.ajax({
						url : url,
						dataType : options.dataType || 'json',
						type : jsonFrom._id != '' ? options.method : 'post',
						data : jsonFrom
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
						submitButton.removeClass('disabled');
					});
				}
			});
		}
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

	window.showError = function(msg) {
		$.fn.yt.tooltip({
			'messageType' : 'danger',
			msg : msg
		});
	}

	window.showInfo = function(msg) {
		$.fn.yt.tooltip({
			'messageType' : 'success',
			msg : msg
		});
	}

	window.showLoading = function(options) {
		var opt = $.extend({
			'text' : '装载中...'
		}, options);
		if ($(opt.to).size() > 0) {
			$(opt.to).isLoading(opt);
		} else {
			$('body').isLoading(opt);
		}
	};

	window.offLoading = function(options) {
		var opt = $.extend({}, options);
		if ($(opt.to).size() > 0) {
			$(opt.to).isLoading('hide');
		} else {
			$('body').isLoading('hide');
		}
	};

	// 插件的defaults
	$.fn.yt.defaults = {
		messageType : 'success'
	};

	$.fn.yt.ad = function() {
		var div = $('<div><h1>我是广告</h1></div>');
		$(div).appendTo($('body'));
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
