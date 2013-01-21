define(function(require, exports, module) {

	var
		$ = require('jquery'),
		hogan = require('lib/hogan'),

		TestExecDashboard = require('./TestExecDashboard');

	UWAP.utils.loadCSS("/stylesheets/textexecdisplay.css");

	var tmpl = require('lib/text!/templates/testFlow.html');
	var template = hogan.compile(tmpl);
	var tmplI = require('lib/text!/templates/testItem.html');
	var templateI = hogan.compile(tmplI);

	var TestExecDisplay = function(definitions, el) {
		var that = this;

		this.definitions = definitions;
		this.el = el || $("<div></div>");
		$(this.el).attr('id', 'TestExecDisplay').empty();

		this.callbacks = {};


		this.flowelements = {};

		// this.defcontainer = $('<div class="results"></div>').appendTo(this.el);

		$.each(this.definitions, function(sid, item) {
			item.sid = sid;		
			var fel = $(template.render(item)).appendTo(that.el)
		});

	};


	TestExecDisplay.prototype.setFlowClean = function(sid) {
		if (!this.flowelements[sid]) throw new Error('Not valid [sid]');
		var l = this.flowelements[sid];
		l.
			removeClass("completed").
			removeClass("success").
			removeClass("warning").
			removeClass("error").
			removeClass("critical").
			removeClass("info");
		l.find("div.testFlowResults").empty();
		l.find("pre.debugConsole").remove();

	}

	TestExecDisplay.prototype.setFlowRunning = function(sid) {
		this.setFlowClean(sid);
		var l = this.flowelements[sid];
		l.addClass("running");
	}

	TestExecDisplay.prototype.setFlowResult = function(sid, result) {
		this.setFlowClean(sid);
		var l = this.flowelements[sid];
		
		l.removeClass('running')
			.addClass('completed')
			.addClass(result.getStatusTag());
		l.find("div.lastRunInfo").html(result.getRunInfo());

		var testflowresel = testflowel.find("div.testFlowResults");
			
		if (testresults.tests) {
			$.each(testresults.tests, function(i, test) {
				templateI.render(test).appendTo(testflowresel);
			});
		} else {
			
		}

		testflowel.append("<pre style=\"clear: both\" class=\"clearfix debugConsole\">" + this.escapeHTML(testresults.debug) + "</div>");

	}






	TestExecDisplay.prototype.proxy = function(c) {
		return $.proxy(c, this)
	}

	TestExecDisplay.prototype.on = function(type, callback) {
		if (!this.callbacks[type]) this.callbacks[type] = [];
		this.callbacks[type].push(callback);
		return this;
	}
	TestExecDisplay.prototype.emit = function(type, parameters) {
		if (this.callbacks[type]) {
			$.each(this.callbacks[type], function(i, c) {
				this.callbacks[type][i].apply(this, Array.prototype.slice.call(arguments, 1))
			});
		}
		return this;
	}

	TestExecDisplay.prototype.appendTo = function(el) {
		$(this.el).appendTo(el);
	} 

	return TestExecDisplay;
});