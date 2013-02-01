define(function(require, exports, module) {
	
	var 
		$ = require('jquery'),
		AppTest = require('./controllers/AppTest');

	require('bootstrap');
	var app = new AppTest($("div#main"));

});