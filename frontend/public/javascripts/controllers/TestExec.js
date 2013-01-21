define(function(require, exports, module) {

	var
		$ = require('jquery'),


		TestExecDisplay = require('./TestExecDisplay'),
		TestExecDashboard = require('./TestExecDashboard');

	// console.log("template", tmpl);

	var TestExec = function(api, el) {
		this.el = el || $("<div></div>");
		$(this.el).attr('id', 'TestExec');

		this.api = api;

	};

	TestExec.prototype.appendTo = function(el) {
		$(this.el).appendTo(el);
	} 

	/**
	 * Verify metadata. This object may only be used further with verified metadata.
	 * 
	 * @param  {[type]} callbackSuccess [description]
	 * @param  {[type]} callbackFailed  [description]
	 * @return {[type]}                 [description]
	 */
	TestExec.prototype.verify = function(callbackSuccess, callbackFailed) {
		var that = this;
		this.api.verify(function(result) {

			if (result.verifyOK()) {
				callbackSuccess();
				that.prepare();

			} else if (result.status === 5) {
				callbackFailed(); 
			} else {
				callbackFailed();
			}

		}, function(error) {
			console.error("Error verifying: ", error);
			$("#verifynow").removeAttr("disabled");
			callbackFailed();
		});
	}

	/**
	 * Called when metadata is verified, retrieve definitions etc.
	 * Then call render()
	 * @return {[type]} [description]
	 */
	TestExec.prototype.prepare = function() {
		var that = this;
		this.api.getDefinitions(function(def) {
			that.definitions = def;
			that.render();
		}, function(err) {
			console.error("Error getting definitions: ", error);
		});
	}

	/**
	 * Drawing all components needed in order to 
	 * @return {[type]} [description]
	 */
	TestExec.prototype.render = function() {


		this.dashboard = new TestExecDashboard();
		this.dashboard.appendTo(this.el);

		this.dashboard
			.on('runAll', this.proxy('runAll'))
			;

		this.ted = new TestExecDisplay(this.definitions);
		this.ted.appendTo(this.el);



	}

	TestExec.prototype.proxy = function(f) {
		return $.proxy(this[f], this)
	}


	TestExec.prototype.runAll = function() {
		console.log("runAll()");
		// this.cleanup();
		this.results = {};
		// $(this.el).removeClass("alltestsdone");
		// this.controllerbarEnable(false);
		this.runAllRemaining();
	}


	TestExec.prototype.runAllRemaining = function() {
		var that = this;
		var key;
		var testflow;
		
		// if (Math.random()>0.4)
		for (var sid in this.definitions) {
			// Do not start on a test flow that has already started..
			if (!this.definitions[sid].started) {

				testflow = this.definitions[sid].id;

				// Check if all dependencies are met, if not, move on to next flow.
				console.log(" ======> About to check dependencies for [" + testflow + "] " + sid);
				if (this.definitions[sid].depends) {
					console.log(" => Dependencies exists ");
					if (!this.editor.item.dependenciesMet(this.definitions[sid].depends)) {
						console.log(" => Dependencies WAS NOT MET ");
						that.resultcontroller.shaddow(testflow, sid, true);
						continue;
					} else {
						console.log(" => Dependencies WAS MET ");
						that.resultcontroller.shaddow(testflow, sid, false);
					}
				}

				this.definitions[sid].started = true;
				that.runTestFlow(sid, that.proxy(that.runAllFlowsRest));
				return;
			}
		}
		
		// Completed with running all flows.
		this.controllerbarEnable(true);
		this.publisher.enable();
		$(this.el).addClass("alltestsdone");


	};

	TestExec.prototype.runTestFlow = function(sid, callback) {
		var 
			that = this;

		if (!this.definitions[sid]) throw {message: "Could not find flow"};
		var testflow = this.definitions[sid].id;

		this.resultcontroller.startFlow(testflow, sid);
		this.connector.runTest(testflow, function(result) {
			var 
				testflowresult,
				changes;
				
			testflowresult = TestFlowResult.build(result);
			changes = that.editor.item.updateResults(testflow, testflowresult);
			testflowresult.changes = changes;

			that.editor.item.save();
			that.resultcontroller.updateFlowResults(testflow, sid, testflowresult);
			that.updateCounter();

			that.results[testflow] = testflowresult;
			
			if (typeof callback === 'function') callback();


		}, function(error) {
			console.error("Error executing : ", error);
			if (typeof callback === 'function') callback();
		});


	};



	return TestExec;
});