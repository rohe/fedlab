var
	// Internal libraries
//     url = require("url"),
// //    connect = require("connect"),
//     http = require('http'),
//     https = require('https'),
	querystring = require('querystring'),
	fs = require('fs'),

	// External dependencies.

	// agent = require('http-agent'),
	// request = require('request'),
	jsdom = require('jsdom'),

	// Exports
	InteractiveHTML,

	// Local variables
	a;



InteractiveHTML = function (config, body, url) {
	this.config = config;
	this.body = body;
	this.url = url;

	var filepath = this.config['path'] + 'frontend/lib/injected-javascript.js';

	this.javascript = fs.readFileSync(filepath, 'utf8');
	console.log("Successfully read javascript: " + this.javascript);
	console.log("reading from: " + filepath);


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
		var title = null;
		
		$("script").remove();
		$("*[onload]").removeAttr("onload");
		$("*[onclick]").removeAttr("onclick");
		$("*[onchange]").removeAttr("onchange");
		
		$("head").append('<base href="' + that.url + '" target="_blank" />');
		$("head").append('<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js"></script>');
		console.log("Prepared some js" + that.javascript);
		var script   = w.document.createElement("script");
		script.type  = "text/javascript";
	//	script.src   = "path/to/your/javascript.js";    // use this for linked script
		script.text  = that.javascript;
		w.document.body.appendChild(script);

		title = $("title").html();
		console.log("found title to be " + title);

		// console.log("Done tweaking document");
		// console.log($("head").html());
		// $("input").attr("value", "andreas");

		// for (var key in w.document) {
		// 	console.log( "   :> " + key);
		// }

		console.log(w.document.innerHTML);
		callback(w.document.innerHTML, title);


	});
}





exports.InteractiveHTML = InteractiveHTML;


