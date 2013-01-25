define(function(require, exports, module) {

	var
		$ = require('jquery'),

		TestFlowResult = require('../models/TestFlowResult'),

		TestExec = require('./TestExec'),

		Error = require('Error');

	// console.log("template", tmpl);

	var TestExecPrepare = function(api) {
		this.api = api;

	};

	/**
	 * Verify metadata. This object may only be used further with verified metadata.
	 * 
	 * @param  {[type]} callback [description]
	 * @return {[type]}                 [description]
	 */
	TestExecPrepare.prototype.verify = function(callback) {
		var that = this;
		this.api.verify(function(result) {

			if (result.verifyOK()) {
				that.prepare(callback);

			} else if (result.status === 5) {
				callback(new Error('Needs interaction! ;)')); 
			} else {
				callback(new Error('Error code: ' + result.status));
			}

		}, function(error) {
			console.error("Error verifying: ", error);
			$("#verifynow").removeAttr("disabled");
			callback(new Error(error));
		});
	}

	/**
	 * Called when metadata is verified, retrieve definitions etc.
	 * Then call render()
	 * @return {[type]} [description]
	 */
	TestExecPrepare.prototype.prepare = function(callback) {
		var that = this;
		this.api.getDefinitions(function(definitions) {
			
			var test = new TestExec(that.api, definitions);
			callback(test);

		}, function(err) {
			callback(new Error("Error getting definitions: " + err));
		});
	}

	return TestExecPrepare;
});
