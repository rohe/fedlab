requirejs(['SAMLdebug'],
function (SAMLdebug) {


	$(document).ready(function() {
		var sd = new SAMLdebug($("body"));
		sd.detect();

	});

});