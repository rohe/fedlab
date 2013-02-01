/*
 * A class that handles communication with the FedLab API.
 */

define(function(require, exports, module) {


	var 
		FlowDefinition = require('../models/FlowDefinition'),
		TestFlowResult = require('../models/TestFlowResult');

	var APIconnector = function(type, metadata) {
		this.type = type;
		this.metadata = metadata;
	};

	APIconnector.prototype.verify = function(callback, callbackerror) {
		var that = this;
		var url = '/api2/' + this.type + '/verify';
		$.ajax({
			url: url,
			dataType: 'json',
			cache: false,
			type: "POST",
			contentType: "application/json; charset=utf-8",
			data: JSON.stringify(this.metadata),
			success: function(response) {
				var res;

				console.log("==> verify() - API Response");
				res = new TestFlowResult(response);
				callback(res);
			
			},
			error: function(error) {
				console.log("Error: " + error);
				callbackerror(error);
			}
			
		});
	}

	APIconnector.prototype.runTest = function(flowid, callback, callbackerror) {
		var that = this;
		var url = '/api2/' + this.type + '/runflow/' + flowid;
		$.ajax({
			url: url,
			dataType: 'json',
			cache: false,
			type: "POST",
			contentType: "application/json; charset=utf-8",
			data: JSON.stringify(this.metadata),
			success: function(response) {
				var res;

				console.log("==> runTest() - API Response");
				console.log(response);
				res = new TestFlowResult(response);
				callback(res);

			},
			error: function(error) {
				console.log("Error: " + error);
				callbackerror(error);
			}
			
		});
	}

	APIconnector.prototype.getDefinitions = function(callback, callbackerror) {
		var that = this;
		var url = '/api2/' + this.type + '/definitions';
		$.ajax({
			url: url,
			dataType: 'json',
			cache: false,
			type: "POST",
			contentType: "application/json; charset=utf-8",
			data: JSON.stringify(this.metadata),
			success: function(response) {
				console.log("==> getDefinitions() - API Response");
				var tfd = [];
				for(var i = 0; i < response.length; i++) {
					tfd.push(new FlowDefinition(response[i]));
				}
				callback(tfd);
			},
			error: function(error) {
				console.log("Error: " + error);
				callbackerror(error);
			}
			
		});
	}

	APIconnector.prototype.publishResults = function(pin, results, callback) {
		var that = this;
		var url = '/api2/' + this.type + '/results/' + pin;
		$.ajax({
			url: url,
			dataType: 'json',
			cache: false,
			type: "POST",
			contentType: "application/json; charset=utf-8",
			data: JSON.stringify(results),
			success: function(response) {
				console.log("==> getDefinitions() - API Response");
				callback(response);
			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.log("Error: ", jqXHR, textStatus, errorThrown);
				var e = JSON.parse(jqXHR.responseText);
				callback(new Error(e.message));
			}
			
		});
	}


	APIconnector.prototype.getResults = function(callback, callbackerror) {
		var that = this;
		var url = '/api2/' + this.type + '/results';
		$.ajax({
			url: url,
			dataType: 'json',
			cache: false,
			type: "GET",
			success: function(response) {
				console.log("==> getDefinitions() - API Response");
				callback(response);
			},
			error: function(error) {
				console.log("Error: " + error);
				callbackerror(error);
			}
			
		});
	}

	// var Result = function(obj) {
	// 	console.log("Result()", obj);
	// 	if (obj === null) {
	// 		throw {message: 'trying to create a new Result object with an empty parameter list'};
	// 	}
	// 	if (!obj.id || typeof obj.id === 'undefined') throw {message: "Missing ID in result object."};
	// 	this.id = obj.id;			
	// 	if (typeof obj.status === 'undefined') throw {message: "Missing ID in result object."};
	// 	this.status = obj.status;

	// 	if (obj.message) this.message = obj.message;
	// 	if (obj.debug) this.debug = obj.debug;
	// 	if (obj.tests) this.tests = obj.tests;

	// 	if (obj.url) this.url = obj.url;
	// 	if (obj.htmlbody) this.htmlbody = obj.htmlbody;
	// 	if (obj.title) this.title = obj.title;
	// }

	// Result.prototype.verifyOK = function() {
	// 	return (this.status < 4);
	// }



	// exports.APIconnectorOld = APIconnector;
	// exports.APIconnector = APIconnector2;
	// exports.Result = Result;

	return APIconnector;

});
