define(function(require, exports, module) {

	var
		$ = require('jquery'),

		TestFlowResult = require('../models/TestFlowResult'),

		Emitter = require('Emitter'),

		PublishController = require('./PublishController'),
		TestExecDisplay = require('./TestExecDisplay'),
		TestExecDashboard = require('./TestExecDashboard');

	// console.log("template", tmpl);

	var TestExec = function(api, definitions, el) {
		this.el = el || $("<div></div>");
		$(this.el).attr('id', 'TestExec');

		this.api = api;
		this.definitions = definitions;

		this.dashboard = new TestExecDashboard();
		this.dashboard.appendTo(this.el);
 
		this.dashboard
			.on('runAll', this.proxy('runAll'))
			.on('configure', this.proxy('destroy'))
			;

		this.publisher = new PublishController(this.api);
		this.publisher.appendTo(this.el);

		this.ted = new TestExecDisplay(this.definitions);
		this.ted.appendTo(this.el);
	};

	TestExec.prototype.destroy = function() {
		this.el.off();
		this.el.remove();
		this.emit('destroyed');
	}


	TestExec.prototype.appendTo = function(el) {
		$(this.el).appendTo(el);
	} 



	TestExec.prototype.proxy = function(f) {
		return $.proxy(this[f], this)
	}


	TestExec.prototype.cleanup = function() {
		this.results = {};
		for (var i = 0; i < this.definitions.length; i++) {
			this.definitions[i].started = false;
		}
		this.ted.cleanup();
		$(this.el).removeClass("alltestsdone");
	}

	TestExec.prototype.runAll = function() {
		// window.z = 0;
		console.log("runAll()");
		
		this.cleanup();
		
		this.dashboard.enable(false);
		this.publisher.disable();
		this.runAllRemaining();

	}


	TestExec.prototype.runAllRemaining = function() {
		var that = this;
		var key;
		
		console.log("runAllRemaining(" + ")");



		// if (window.z++ < 3)
		for (var i = 0; i < this.definitions.length; i++) {

			// Do not start on a test flow that has already started..
			if (this.definitions[i].started) continue;

			// Skip flow if not all dependencies are met...
			if (!this.isDependenciesMet(this.definitions[i])) {
				continue;
			}

			this.definitions[i].started = true;
			that.runTestFlow(this.definitions[i], that.proxy('runAllRemaining'));
			return;
		}
		
		// Completed with running all flows.
		this.allDone();

	};

	TestExec.prototype.allDone = function() {
		console.log("All tests done...")
		$(this.el).addClass("alltestsdone");
		this.dashboard.enable(true);
		this.publisher.enableWithResults(this.results);

	}

	TestExec.prototype.isDependenciesMet = function(testflow) {
		// console.log("Checking if dependencies is met for testflow " + testflow.id)
		// console.log(this.results);
		if (!testflow.hasDependencies()) return true;
		for(var i = 0; i < testflow.depends.length; i++) {
			if (!this.results[testflow.depends[i]]) return false;
			if (!this.results[testflow.depends[i]].ok()) return false;
		}
		return true;
	}

	TestExec.prototype.runTestFlow = function(testflow, callback) {
		var 
			that = this;

		console.log("runTestFlow(" + testflow.id + ", ", callback, ")");


		// if (!this.definitions[sid]) throw {message: "Could not find flow"};
		// var testflow = this.definitions[sid].id;

		this.ted.setFlowRunning(testflow);
		this.api.runTest(testflow.id, function(result) {
			var 
				testflowresult,
				changes;
				
			testflowresult = TestFlowResult.build(testflow.sid, result);
			// changes = that.editor.item.updateResults(testflow, testflowresult);
			// testflowresult.changes = changes;

			// that.editor.item.save();
			that.ted.setFlowResult(testflowresult);
			// that.updateCounter();

			that.results[testflow.id] = testflowresult;

			if (typeof callback === 'function') callback();


		}, function(error) {
			console.error("Error executing : ", error);
			if (typeof callback === 'function') callback();
		});


	};
	$.extend(TestExec.prototype, Emitter);


	return TestExec;
});