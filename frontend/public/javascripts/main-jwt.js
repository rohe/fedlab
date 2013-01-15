define(function(require, exports, module) {

	require('bootstrap');

	var 
		$ = require('jquery'),
		JWTToolApp = require('jwt/JWTToolApp'),
		jwt = require('./jwt/JWT');

	$(document).ready(function(){
		

		jwt.jwtlog = function(args) {
			jt.debug(args);
		}
		jwt.jwtdebug = function(args) {
			jt.log(args);
		}

		var jt = new JWTToolApp($("div#main"));
		console.log("Loaded...");
		// window.jwtdebug = function(args) {
		// 	jt.debug(args);
		// }
		// window.jwtlog = function(args) {
		// 	jt.log(args);
		// }

	});

});