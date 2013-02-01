define(function(require, exports, module) {

	var
		$ = require('jquery'),
		hogan = require('lib/hogan'),

		Emitter = require('Emitter');

	// UWAP.utils.loadCSS("/stylesheets/textexecdisplay.css");

	var tmpl = require('lib/text!/templates/TestExecDashboard.html');
	var template = hogan.compile(tmpl);

	var TestExecDashboard = function(el) {
		this.el = el || $("<div></div>");
		$(this.el).attr('id', 'TestExecDashboard');

		this.callbacks = {};

		$(this.el).append(template.render({}));

		$(this.el).on('click', '#runall', this.proxy(function() {
			this.emit('runAll');
		}));
		$(this.el).on('click', '#configure', this.proxy(function() {
			this.emit('configure');
		}));
	}

	TestExecDashboard.prototype.enable = function(enable) {
		if (enable) {
			// console.log("Enaling controller");
			$(this.el).find("input").removeAttr('disabled');				
		} else {
			// console.log("Disabling controller");
			$(this.el).find("input").attr('disabled', true);
		}
	}

	TestExecDashboard.prototype.proxy = function(c) {
		return $.proxy(c, this)
	}


	TestExecDashboard.prototype.appendTo = function(el) {
		$(this.el).appendTo(el);
	} 
	$.extend(TestExecDashboard.prototype, Emitter);

	return TestExecDashboard;
});