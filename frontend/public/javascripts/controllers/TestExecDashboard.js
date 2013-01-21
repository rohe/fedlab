define(function(require, exports, module) {

	var
		$ = require('jquery'),
		hogan = require('lib/hogan');

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
	};

	TestExecDashboard.prototype.proxy = function(c) {
		return $.proxy(c, this)
	}

	TestExecDashboard.prototype.on = function(type, callback) {
		if (!this.callbacks[type]) this.callbacks[type] = [];
		this.callbacks[type].push(callback);
		return this;
	}

	TestExecDashboard.prototype.emit = function(type) {
		var that = this;
		if (this.callbacks[type]) {
			$.each(this.callbacks[type], function(i, c) {
				that.callbacks[type][i].apply(this, Array.prototype.slice.call(arguments, 1))
			});
		}
		return this;
	}

	TestExecDashboard.prototype.appendTo = function(el) {
		$(this.el).appendTo(el);
	} 

	return TestExecDashboard;
});