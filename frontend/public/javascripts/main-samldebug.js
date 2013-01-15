define(function(require, exports, module) {

	require('bootstrap');
	require('google-code-prettify/prettify')

	var SAMLdebug = require('./samldebug/SAMLdebug');

	$(document).ready(function() {
		var sd = new SAMLdebug($("body"));
		sd.detect();
	});

});