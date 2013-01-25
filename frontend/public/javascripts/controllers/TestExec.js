define(function(require, exports, module) {

	var
		$ = require('jquery'),

		TestFlowResult = require('../models/TestFlowResult'),

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
			;

		this.ted = new TestExecDisplay(this.definitions);
		this.ted.appendTo(this.el);

	};

	TestExec.prototype.appendTo = function(el) {
		$(this.el).appendTo(el);
	} 



	TestExec.prototype.proxy = function(f) {
		return $.proxy(this[f], this)
	}


	TestExec.prototype.runAll = function() {
		console.log("runAll()");
		// this.cleanup();
		this.results = {};
		$(this.el).removeClass("alltestsdone");
		// this.controllerbarEnable(false);
		this.dashboard.enable(false);
		this.runAllRemaining();
	}


	TestExec.prototype.runAllRemaining = function() {
		var that = this;
		var key;
		
		// console.log("runAllRemaining(" + ")");

		if (Math.random()>0.4)
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
		// this.controllerbarEnable(true);
		// this.publisher.enable();
		
		$(this.el).addClass("alltestsdone");
		this.dashboard.enable(false);


	};

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



	return TestExec;
});