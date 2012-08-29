requirejs(['ResultController'],
function (ResultController) {

	$(document).ready(function() {
		var r = new ResultController($("body"));
	
		$(document).ready(function() {
			setInterval(function() {
				$("span.lastRunDate").prettyDate();
			}, 30000);
		});
	});

});