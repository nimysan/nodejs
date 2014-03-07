(function(window, $) {
	var Bushhole = function() {
	};
	Bushhole.prototype = {
		sm : function(form) {
			$.post('send', {
				'value' : $(form).find('#inputpoint').val()
			}, 'json').done(function() {
				// alert("send successfully!");
				bh.pm();
			});
			return false;
		},
		// poll message from server
		pm : function() {
			$.get('poll', function(data) {
				bh.renderMessages(data.view);
			});
		},
		renderMessages : function(data) {
			var existSize = $('#popface h4').size();
			if (data.length < existSize) {
				return;
			}
			for (var i = existSize; i < data.length; i++) {
				var popfaceItem = $('<h4>').text(data[i]);
				$('#popface').append(popfaceItem);
			}
			console.log(data);
		},
		initialize : function() {
			$('#submit_button').click(function() {
				bh.sm($(this).parent('form'));
				return false;
			});
		}
	};
	var bh = window.bh = new Bushhole(); // expose
	$(window.document).ready(function() {
		window.bh.initialize();
		function sayHi() {
			setTimeout(sayHi, 1000);
			window.bh.pm();
		}
		sayHi();
	});
})(window, jQuery);