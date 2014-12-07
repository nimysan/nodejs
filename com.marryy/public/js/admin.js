(function(window, $) {
	'use strict';

	$('#space_name').change(function() {
		var name = $(this).val();
		$.ajax({
			url : '/admin/space/' + name,
			dataType : 'json',
			type : 'get'
		}).done(function(result) {
			if (result && 1 === result) {
				$('#fail').text('Space with name ' + name + ' already exists');
				$('#success').addClass('hide');
				$('#fail').removeClass('hide');
			} else {
				$('#success').text('The name is available!');
				$('#success').removeClass('hide');
				$('#fail').addClass('hide');
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
				$('#fail').text('Failed to create the space ' + name);
				$('#success').addClass('hide');
				$('#fail').removeClass('hide');
			} else {
				$('#success').text('Create space successfully!');
				$('#success').removeClass('hide');
				$('#fail').addClass('hide');
			}
		});
	});

})(window, jQuery);