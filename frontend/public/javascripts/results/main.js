define(function(require, exports, module) {

	var ResultController = require('./ResultController');

	$(document).ready(function() {
		var r = new ResultController($("body"), 'connect');
	
		$(document).ready(function() {
			setInterval(function() {
				$("span.lastRunDate").prettyDate();
			}, 30000);
		});
	});

});
