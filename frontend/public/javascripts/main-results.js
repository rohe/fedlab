define(function(require, exports, module) {

	require('bootstrap');

	var 
		$ = require('jquery'),
		ResultController = require('./controllers/ResultDisplayController');

	$(document).ready(function() {
		var r = new ResultController($("body"), 'connect');
	
		$(document).ready(function() {
			setInterval(function() {
				$("span.lastRunDate").prettyDate();
			}, 30000);
		});
	});

});
