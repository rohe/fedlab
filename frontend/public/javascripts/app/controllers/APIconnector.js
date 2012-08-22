(function ($, exports) {


	var Result = Spine.Class.sub({
		init: function(obj) {
			if (typeof obj.id === 'undefined') throw {message: "Missing ID in result object."};
			this.id = obj.id;			
			if (typeof obj.status === 'undefined') throw {message: "Missing ID in result object."};
			this.status = obj.status;

			if (obj.message) this.message = obj.message;
			if (obj.debug) this.debug = obj.debug;
			if (obj.tests) this.tests = obj.tests;

			if (obj.url) this.url = obj.url;
			if (obj.htmlbody) this.htmlbody = obj.htmlbody;
			if (obj.title) this.title = obj.title;
		},
		verifyOK: function() {
			return (this.status < 4);
		}
	});

	/**
	 * Main controller for dealing with testing.
	 * This class is instanciated after metadata is successfully configured.
	 * @type {[type]}
	 */
	var APIconnector = Spine.Class.sub({

		/**
		 * Initialization
		 * @param  {string} type     Which test backend is used: saml or connect
		 * @param  {object} metadata A metadata object
		 * @return {object}          Return object.
		 */
		init: function(type, metadata) {
			this.type = type;
			this.metadata = metadata;
		},
		/**
		 * Sends a message to the verify API with metadata, and receives a Result object back.
		 * @param  {Function} callback      The callback(result) returns a result object with the status code
		 * @param  {Function}   errorcallback The errorcallback(err) returns a error object when something when bad.
		 * @return {undefined}                 void
		 */
		verify: function(callback, errorcallback) {
			this.runTestRaw("verify", null, callback, errorcallback)
		},

		runTest: function(testflow, callback, errorcallback) {
			this.runTestRaw("runFlow", testflow, callback, errorcallback)
		},

		/**
		 * This is a raw API operation that expect a result object in return.
		 * It is used both for runtest and for verify.
		 * 
		 * @param  {string}   operation     Which API operation to run: verify or...
		 * @param  {string}   testflow      ID of testflow to run
		 * @param  {Function} callback      The callback(result) returns a result object with the status code
		 * @param  {Function} errorcallback The errorcallback(err) returns a error object when something when bad.
		 * @return {undefined}              Returns void
		 */
		runTestRaw: function(operation, testflow, callback, errorcallback) {
			console.log("About to do API connector (" + this.type + " " + operation + " " + testflow + ") - here is the metadata");
			console.log(this.metadata);

			var postdata = {
				operation: operation,
				metadata: this.metadata,
				type: this.type
			};
			if (testflow) {
				postdata.flow = testflow;
			}

			$.ajax({
				url: "/api",
				cache: false,
				type: "POST",
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				data: JSON.stringify(postdata),
				success: function(response) {
					var res;
					console.log("API Response /" + operation + ' / ' + testflow, response);

					if (response.status && response.status === "ok") {
						res = new Result(response.result);
						callback(res);
					} else {
						errorcallback(response);
					}
				},
				error: function(jqXHR, textStatus, errorThrown) {
					errorcallback({message: 'Problem accessing the API on the verify operation: ' + textStatus});
				}
				
			});
		},

		getDefinitions: function(callback, callbackerror) {
			var that = this;
			var postdata = {
				operation: "definitions",
				metadata: this.metadata, //JSON.parse(JSON.stringify(this.editor.item)),
				type: this.type
			};
			$.ajax({
				url: "/api",
				dataType: 'json',
				cache: false,
				type: "POST",
				contentType: "application/json; charset=utf-8",
				data: JSON.stringify(postdata),
				success: function(response) {
					console.log("==> getDefinitions() - API Response");
					if (response.status === "ok") {	
						callback(response.result);
					} else {
						callbackerror(response);
					}

				},
				error: function(error) {
					console.log("Error: " + error);
					callbackerror(error);
				}
				
			});
		}
	});


	exports.APIconnector = APIconnector;

	
})(jQuery, window);

