define(function(require, exports, module) {

	var
		$ = require('jquery'),
		hogan = require('lib/hogan');

	// UWAP.utils.loadCSS("/stylesheets/textexecdisplay.css");

	var tmpl = require('lib/text!/templates/publish.html');
	var template = hogan.compile(tmpl);

	var PublishController = function(api, el) {
		this.api = api;
		this.el = el || $("<div></div>");
		this.el.attr('id', 'PublishController');

		this.results = {};

		$(this.el).append(template.render({type: this.api.type}));

		this.el.hide();

		this.el.on("click", "input#dopublish", this.proxy('publish'));

	};

	PublishController.prototype.enableWithResults = function(res) {
		this.results = res;
		$(this.el).show()
		$(this.el).find("input#dopublish").removeAttr("disabled");
	};

	PublishController.prototype.disable = function() {
		$(this.el).find("input#dopublish").attr("disabled", "disabled");
	};

	PublishController.prototype.publish = function() {
		var 
			post = {}, 
			pincode,
			that = this,
			data;

		if (!this.results) return;

		pincode = $(this.el).find("input.pincode").attr("value");
		data = {
			lastRun: Math.round(new Date().getTime()),
			results: {}
		};
		for(var key in this.results) {
			data.results[key] = this.results[key].status;
		}

		console.log("publish results");
		console.log(this.results);
		console.log(pincode, data);


		this.api.publishResults(pincode, data, function(res) {

			if (res instanceof Error) {
				alert('Error occured  ' + res);
				return;
			}

			console.log("Success posting results");
			that.disable();
			alert("Successfully published testresults");
		});
	};

	PublishController.prototype.proxy = function(c) {
		return $.proxy(this[c], this)
	}

	PublishController.prototype.appendTo = function(el) {
		$(this.el).appendTo(el);
	} 

	return PublishController;


});