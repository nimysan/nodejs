(function(window, $) {
	'use strict';

	function _showStatus(text, trueOrFalse) {
		$('div.form-group span').removeClass('hide');
		$('label.control-label').text(text).removeClass('hide');
		if (trueOrFalse) {
			$('div.form-group span.glyphicon').addClass('glyphicon-ok')
					.removeClass('glyphicon-remove');
			$('div.form-group').removeClass('has-error')
					.addClass('has-success');
		} else {
			$('div.form-group span.glyphicon').addClass('glyphicon-remove')
					.removeClass('glyphicon-ok');
			$('div.form-group').removeClass('has-success')
					.addClass('has-error');
		}

	}

	$('#space_name').change(function() {
		var name = $(this).val();
		$.ajax({
			url : '/admin/space/' + name,
			dataType : 'json',
			type : 'get'
		}).done(function(result) {
			if (result && 1 === result) {
				_showStatus('Space is not availale', false);
			} else {
				_showStatus('Space is availale', true);
			}
		});
	});

	$('#create_space').click(function() {
		var name = $('#space_name').val();
		$.ajax({
			url : '/admin/space/' + name,
			dataType : 'json',
			type : 'post'
		}).done(function(result) {
			if (result && 0 === result) {
				_showStatus('Failed to create space', false);
			} else {
				_showStatus('Create space successfully', true);
			}
		});
	});

})(window, jQuery);