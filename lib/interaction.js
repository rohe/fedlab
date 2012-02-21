var
	// Internal libraries
//     url = require("url"),
// //    connect = require("connect"),
//     http = require('http'),
//     https = require('https'),
	querystring = require('querystring'),


	// External dependencies.

	// agent = require('http-agent'),
	// request = require('request'),
	jsdom = require('jsdom'),

	// Exports
	InteractiveHTML,

	
	// Local variables
	a;




InteractiveHTML = function (body, url) {
	this.body = body;
	this.url = url;
};


InteractiveHTML.prototype.getJQuery = function(callback, errorCallback) {

	var self = this;

	jsdom.env(this.body, ['http://code.jquery.com/jquery-1.5.min.js'], 
		function (err, w) {
			if (w) {
				callback(self, w);
			} else {
				errorCallback(self, err);				
			}
		}
	);
	
}

InteractiveHTML.prototype.getBody = function() {
	return this.body;
}

InteractiveHTML.prototype.getInteractive = function(callback) {
	var that = this;

	this.getJQuery(function(ia, w) {
		console.log("Got Query");
	//console.log(w.jQuery());
		var $ = w.jQuery;
		
		$("script").remove();
		$("*[onload]").removeAttr("onload");
		$("*[onclick]").removeAttr("onclick");
		$("*[onchange]").removeAttr("onchange");
		
		$("head").append('<base href="' + that.url + '" target="_blank" />');
		$("head").append('<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js"></script>');
		console.log("Preparing some js");
		var ijs = '$(document).ready(function() {' +
				'$("a").bind("click", function(e) { ' + 
					'e.preventDefault();' +
					'console.log("Clicking on a A link, with content: ");' +
					'console.log($(e.target).text());' +
				'});' +
				'$("form").each(function(i, formitem) {' +
					'$(formitem).bind("submit", function(e) { ' + 
						'e.preventDefault();' +
						// 'console.log("Clicking on Form #"+ i + ": ");' +
						// 'console.log(e);' +
						// 'console.log($(e.target).attr("id"));' +
						'var obj = {};' + 
						'$(formitem).find(":input").each(function() {' +
							'if ($(this).attr("name")) {' +
								'obj[$(this).attr("name")] = $(this).attr("value");' +
							'}' +
							// 'console.log("Found input element"); ' +
						'});' +
						'window.parent.postMessage(obj, "*");' +
						'console.log("Posting object to parent window");' +
						// 'console.log(window.parent);' +
					'});' +
				'});' +
			'});';
		console.log("Prepared some js");
		var script   = w.document.createElement("script");
		script.type  = "text/javascript";
	//	script.src   = "path/to/your/javascript.js";    // use this for linked script
		script.text  = ijs;
		w.document.body.appendChild(script);
		

		// console.log("Done tweaking document");
		// console.log($("head").html());
		// $("input").attr("value", "andreas");

		// for (var key in w.document) {
		// 	console.log( "   :> " + key);
		// }

		console.log(w.document.innerHTML);
		callback(w.document.innerHTML);


	});
}





exports.InteractiveHTML = InteractiveHTML;


