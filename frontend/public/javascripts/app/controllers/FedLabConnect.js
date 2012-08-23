(function ($, exports) {

	
	
	var FedLabConnect = Spine.Controller.sub({
		entityloader: null,
		events: {
			"click #verifynow": "startVerify",
			"click #runall": "runAllFlows",
			"click #configure": "configure"
		},
		init: function(args){
			var c, newentity;

			this.definitions = null;
			this.modelType = this.type.modelType; // was OAuthEntity
			this.results = {};

			
			// console.log(typeof this.type);
			if (!this.type || !(typeof this.type === 'function')) {
				throw ("type parameter of FedLab() MUST be a descendant of the TestEntity model.");
				// TODO: dont know exactly how to check the descendant thing yet. instanceof is not working.
			}
			
			this.modelType.bind("edit", this.proxy(this.selectEntity));
			
			this.entityloader = new EntityLoader({
				el: this.el.find("fieldset.storeconfiguration"),
				modelType: this.modelType
			});

			this.modelType.fetch();

			c = this.modelType.count();
			if (c === 0) {
				newentity = new this.modelType();
				newentity.save();
				newentity.edit();
			} else if (c === 1) {
				this.modelType.first().edit();
			} else {
				// More than one stored confiuration found, wait for user to select an configuratiom to edit..
				// (or create a new one)
				
			}
			
			this.stateChange("modeEdit");
			
			this.resultcontroller = new ResultController({
				el: $("div#results")
			});
			this.resultcontroller.bind("run", this.proxy(function(sid) {
				// console.log("Run test for " + sid);
				this.runTestFlow(sid);
			}));

			this.publisher = new PublishController({el: $("div#publishbar")}, this);


		},
		startVerify: function() {

			$("#verifynow").attr("disabled", "disabled");

			this.resultcontroller.startFlow("verify", "openidconnectverifytestflow");
			
			this.connector = new APIconnector("connect", this.editor.item.metadata);
			this.connector.verify($.proxy(this.verifyResponse, this), function(error) {
				console.error("Error verifying: ", error);
				$("#verifynow").removeAttr("disabled");
			});

		},

		verifyResponse: function(result) {
			console.log("API Response /Verify");
			console.log(result);
			$("#verifynow").removeAttr("disabled");


			testflowresult = TestFlowResult.build(result);
			// var changes = that.editor.item.updateResults(testflow, testflowresult);
			// testflowresult.changes = changes;
			// that.editor.item.save();
			this.resultcontroller.updateFlowResults("verify", "openidconnectverifytestflow", testflowresult);

			if (result.verifyOK()) {
				this.stateChange("modeTest");
				this.connector.getDefinitions($.proxy(this.definitionsResponse, this), function(err) {
					console.error("Error getting definitions: ", error);
					$("#verifynow").removeAttr("disabled");
				});
				return;

			} else if (result.status == 5) {

				var ia = new UserInteraction(result.url, result.htmlbody, result.title);
				ia.bind("userinteraction", this.proxy(this.userinteraction));
				$("body").append(ia.el);
			}
		},

		userinteraction: function(msg) {
			console.log("User interaction. Current editor item:");
			console.log(this.editor.item);
			this.editor.item.addUserinteraction(msg);
			this.editor.item.save();
			this.editor.item.edit();

			this.startVerify();
		},

		definitionsResponse: function(def) {

			this.definitions = def;

			$("div#results").empty();
			
			$.each(def, function(sid, item) {
				item.sid = sid;
				// console.log("Item for TestFLow tmpl()");
				// console.log(JSON.parse(JSON.stringify(item)));
				$("div#results").append($("#testFlow").tmpl(item));							
			});
			
			$(this.el).find("#testcontroller_name").html(this.editor.item.title);
			
			// console.log("Got definitions");
			// console.log(that.definitions);
			// that.runAllFlows();
			// $("div#results pre").text(response);

		},



		updateCounter: function() {
			var res = this.editor.item.countResults();
			var el = $(this.el).find("div#resultcounter").empty();

			console.log("Update counter: ");
			console.log(res);

			if (res[1] > 0) {
				el.append('<span class="resultcountitem" ><img src="/images/accept.png" /> ' + res[1] + ' tests succeeded</span>');
			}
			if (res[2] > 0) {
				el.append('<span class="resultcountitem" ><img src="/images/error.png" /> ' + res[1] + ' warnings</span>');
			}
			if (res[3] + res[4] > 0) {
				el.append('<span class="resultcountitem" ><img src="/images/exclamation.png" /> ' + (res[3] + res[4]) + ' tests failed</span>');
			}
			if (res[0] > 0) {
				el.append('<span class="resultcountitem" ><img src="/images/information.png" /> ' + res[0] + ' messages</span>');
			}

		},

		
		stateChange: function(newState) {
			
			var validClasses = ["modeEdit", "modeTest"];
			// console.log("State change to " + newState);
			// 			console.log($(this.el))	;
			$.each(validClasses, this.proxy(function(i, tclass) {
				// console.log("Check " + tclass);
				if (newState === tclass) {
					$(this.el).addClass(tclass)
				} else {
					$(this.el).removeClass(tclass)					
				}
			}))

		},

		cleanup: function() {
			for (sid in this.definitions) {
				this.definitions[sid].started = false;
			}

		},
		runAllFlowsRest: function() {
			var that = this;
			var key;
			var testflow;
			
			// if (Math.random()>0.4)
			for (sid in this.definitions) {
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


		},
		controllerbarEnable: function(enable) {
			if (enable) {
				// console.log("Enaling controller");
				$(this.el).find("div#testcontrollerbar").find("input").removeAttr('disabled');				
			} else {
				// console.log("Disabling controller");
				$(this.el).find("div#testcontrollerbar").find("input").attr('disabled', true);
			}
		},
		runAllFlows: function() {
			this.cleanup();
			this.results = {};
			$(this.el).removeClass("alltestsdone");


			// this.resultcontroller.cleanup();

			this.controllerbarEnable(false);
			this.runAllFlowsRest();
		},
		runTestFlow: function(sid, callback) {
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


		},
		configure: function(e) {
			var that = this;
			if (e) {
				e.preventDefault();
				e.stopPropagation();	
			}
			if (this.publisher) {
				// this.publisher.release();
				$("div#publishbar").hide();
			}
			
			$(this.el).find("div#results").empty();
			that.stateChange("modeEdit");
		},
		selectEntity: function(entity) {
			
			$(this.el).addClass("editorOpen");

			// Save and clean up currently open 
			if (this.editor && !this.editor.item.destroyed) {
				this.editor.updateModel();
				this.editor.release();
				this.editor = null;
			}
			if ($(this.el).find("#editorcontainer div#editor").length === 0) {
				$(this.el).find("#editorcontainer").html("<div id=\"editor\"></div>");				
			} else {
			}
			// Create new editor
			// console.log("Creating new editor...");
			// console.log(this);
			this.editor = new this.type({
				el: $(this.el).find("#editor"),
				type: this.modelType,
				item: entity
			});

			var verifydef = {
				id: "verify",
				sid: "openidconnectverifytestflow",
				name: "Basic Connectivity Verification",
				descr: "Before we continue to the real test cases, we will run a basic conncetivity test given your current metadata entry. If this fails, you will be able to revisit your metadata configuration, or even fix some problems with your Provider, and then run the verification again."
			};
			$("div#results").empty().append($("#testFlow").tmpl(verifydef));
			
			// AUTOMATICALLY START VERIFY? For quicker development.
			// this.verify();
			
		}

	});

	exports.FedLabConnect = FedLabConnect;
	
	
})(jQuery, window);

