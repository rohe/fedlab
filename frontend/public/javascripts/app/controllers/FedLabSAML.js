(function ($, exports) {


	var FedLabSAML = Spine.Controller.sub({
		entityloader: null,
		events: {
			"click #verifynow": "startVerify",
			"click input#runall": "runAllFlows",
			"click input#configure": "configure"
		},
		init: function(args){
			var c, newentity;

			this.definitions = null;
			this.results = {};
			
			this.stateChange("modeEdit");
			
			this.resultcontroller = new ResultController({
				el: $("div#results")
			});
			this.resultcontroller.bind("run", this.proxy(function(sid) {
				// console.log("Run test for " + sid);
				this.runTestFlow(sid);
			}));

			this.publisher = new PublishController({el: $("div#publishbar")}, this);



			$('ul#samlnav a').click(function (e) {
				e.preventDefault();
				console.log("Clicked tab", this);
				$(this).tab('show');
			});
			$("button#firstcontinue").click(function(e) {
				$('ul#samlnav a:last').tab('show');
				e.preventDefault();
			});


			console.log("Fedlab SAML initiated...");
			console.log(this.el);

		},
		startVerify: function(e) {
			console.log("startVerify");
			$("#verifynow").attr("disabled", "disabled");

			if (e) {
				e.preventDefault();
				e.stopPropagation();
			}

			// Get metadata from form and store to localstorage
			this.metadata = {
				metadata: $("form#configurationForm textarea#metadatafield").val(),
				initsso: $("form#configurationForm input#fedlab_initsso").val(),
				attributeurl: $("form#configurationForm input#fedlab_attributeurl").val(),
				initslo: $("form#configurationForm input#fedlab_initslo").val()
			};
			localStorage.setItem('samlspMetadata', JSON.stringify(this.metadata));

			console.log("Start verify...");

			this.resultcontroller.startFlow("verify", "samlverifyflow");
			
			this.connector = new APIconnector("saml", this.metadata);
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
			this.resultcontroller.updateFlowResults("verify", "samlverifyflow", testflowresult);
			$("#verifyError").empty();

			if (result.verifyOK()) {
				this.stateChange("modeTest");
				this.connector.getDefinitions($.proxy(this.definitionsResponse, this), function(err) {
					console.error("Error getting definitions: ", error);
					$("#verifynow").removeAttr("disabled");
				});
				return;

			} else if (result.status == 5) {
				alert('NOT SUPPORTED User interactions yet.');
				// NOT SUPPORTED User interactions yet.
				// 
				// var ia = new UserInteraction(result.url, result.htmlbody, result.title);
				// ia.bind("userinteraction", this.proxy(this.userinteraction));
				// $("body").append(ia.el);
			} else {
				console.log("Result object", result.debug);
				$("#verifyError").append(result.debug);

			}
		},



		definitionsResponse: function(def) {
			console.log("defintionss", def);
			this.definitions = def;

			$("div#results").empty();
			
			$.each(def, function(sid, item) {
				item.sid = sid;
				// console.log("Item for TestFLow tmpl()");
				// console.log(JSON.parse(JSON.stringify(item)));
				$("div#results").append($("#testFlow").tmpl(item));							
			});
			
			$(this.el).find("#testcontroller_name").html('SAML Provider');

		},



		updateCounter: function() {
			// var res = this.editor.item.countResults();
			res = 0;
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
				console.log("Editor", that.editor);
				// changes = that.editor.item.updateResults(testflow, testflowresult);
				// testflowresult.changes = changes;

				// that.editor.item.save();
				// 
				console.log("Updating resultcontroller", that.resultcontroller, testflow, sid, testflowresult);
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

	exports.FedLabSAML = FedLabSAML;
	
	
})(jQuery, window);

