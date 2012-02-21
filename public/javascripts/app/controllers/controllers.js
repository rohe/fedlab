(function ($, exports) {

	var EntitySelector = Spine.Controller.sub({
		init: function() {
			// console.log('init() EntitySelector')
		}
	});
	
	var EntityEditor = Spine.Controller.sub({
		init: function() {
			if (typeof this.type !== 'function') {
				throw 'Missing required property on Editor: type';
			}			
			this.item.bind("destroy", this.proxy(this.remove));
			this.render();
		},
		render: function() {
			console.log("Render() with template ID " + this.templateID);
			console.log(this.item);
			var template = $("#" + this.templateID).tmpl( this.item );
			$(this.el).html( template );
		},
		remove: function() {
			this.release();
		},
		setEntry: function(item) {
			this.item = item;
		}
	});
	
	
	var OAuthEditor = EntityEditor.sub({
		modelType: OAuthEntity,
		templateID: "oauthprovider",
		events: {
	      "change input[type=checkbox]": "updateModel",
	      "change input[type=select]": "updateModel",
	      "click": "updateModel",
	      "blur input[type=text]": "updateModel"
	    },
		init: function() {
			if (typeof this.type !== 'function') {
				throw 'Missing required property on Editor: type';
			}			
			this.item.bind("destroy", this.proxy(this.remove));
			this.render();

		},
		updateModel: function() {
			var cur = this;

			
			var title = $(this.el).find("input#title").val();
			
			if (!this.item.metadata) this.item.metadata = {};
			if (!this.item.metadata.client) this.item.metadata.client = {};
			if (!this.item.metadata.provider) this.item.metadata.provider = {};
			// if (!this.item.metadata.provider.endpoints) this.item.metadata.provider.endpoints = {};


			
			this.item.title = title;
			this.item.metadata.provider.issuer = $(this.el).find("input#issuer").val();
			
			$.each(this.item._endpoints, function(key, ep) {
				var found  = $(cur.el).find("input#" + key + "_endpoint").val();
				if (found !== '') {
					cur.item.metadata.provider[key] = found;
				} else {
					delete cur.item.metadata.provider[key];
				}
			});

			this.item.metadata.client.client_id = $(this.el).find("input#client_id").val();
			this.item.metadata.client.client_secret = $(this.el).find("input#client_secret").val();
			this.item.metadata.client.auth_type = $(this.el).find("select#auth_type").val();
			this.item.metadata.client.client_type = $(this.el).find("select#client_type").val();
			
			// console.log("Saving item:");
			// 			console.log(this.item);
			try {
				this.item.save();				
			} catch(e) {
				console.log("could not save sucessfully:");
				console.log(e);
				console.trace();
			}
			
		}

	});
	OAuthEditor.include({
		templateID: "oauthprovider"
	});
	OAuthEditor.extend({
		modelType: OAuthEntity
	});
	
	var OICProviderEditor = EntityEditor.sub({
		events: {
	      "change input[type=checkbox]": "updateModel",
	      "change input[type=select]": "updateModel",
	      "click": "updateModel",
	      "blur input[type=text]": "updateModel"
	    },
		init: function() {

			if (typeof this.type !== 'function') {
				throw 'Missing required property on Editor: type';
			}			
			this.item.bind("destroy", this.proxy(this.remove));
			this.render();
			this.adjustUI();

		},
		// This function turns off the endpoints, etc that are not relevant depending on the features
		// turned on.
		adjustUI: function() {
			
			// console.log("Adjusting UI");
			// console.log(this.item);
			
			if (this.item.metadata.provider.features.registration) {
				$(this.el).find("div#clientconfiguration").hide();
			} else {
				$(this.el).find("div#clientconfiguration").show();
			}
			
			if (this.item.metadata.provider.features.discovery) {
				$(this.el).find("p.p_endpoint").hide();
				$(this.el).find("p#p_discovery_endpoint").show();
				
			} else {
				$(this.el).find("p.p_endpoint").show();
				$(this.el).find("p#p_discovery_endpoint").hide();
				
				if (!this.item.metadata.provider.features.sessionmanagement) {
					$(this.el).find("p#p_refresh_session_endpoint").hide();
					$(this.el).find("p#p_end_session_endpoint").hide();
				}
				
			}
		},
		updateModel: function() {
			var cur = this;

			var title = $(this.el).find("input#title").val();

			if (!this.item.metadata) this.item.metadata = {};
			if (!this.item.metadata.client) this.item.metadata.client = {};
			if (!this.item.metadata.provider) this.item.metadata.provider = {};
			// if (!this.item.metadata.provider.endpoints) this.item.metadata.provider.endpoints = {};
			if (!this.item.metadata.provider.features) this.item.metadata.provider.features = {};

			this.item.title = title;
			this.item.metadata.provider.issuer = $(this.el).find("input#issuer").val();

			$.each(this.item._endpoints, function(key, ep) {
				var found  = $(cur.el).find("input#" + key + "_endpoint").val();
				if (found !== '') {
					cur.item.metadata.provider[key] = found;
				} else {
					delete cur.item.metadata.provider[key];
				}
			});
			
			this.item.metadata.provider.features.discovery = !!($(cur.el).find("input#usediscovery:checkbox:checked").val());
			this.item.metadata.provider.features.registration = !!($(cur.el).find("input#useregistration:checkbox:checked").val());
			this.item.metadata.provider.features.sessionmanagement = !!($(cur.el).find("input#usesessionmanagement:checkbox:checked").val());
			
			this.item.metadata.provider.supported_response_types = [];
			$.each(this.item._response_types, function(key, rt) {
				var found  = !!($(cur.el).find("input#" + key + ":checkbox:checked").val());
				if (found) {
					cur.item.metadata.provider.supported_response_types.push(cur.item._response_types[key].title);
				}
			});
			this.item.metadata.provider.supported_scopes = ['openid'];
			$.each(this.item._scopes, function(key, ep) {
				var found  = !!($(cur.el).find("input#" + key + ":checkbox:checked").val());
				if (found) {
					cur.item.metadata.provider.supported_scopes.push(key);
				}
			});
			this.item.metadata.provider.algoritms = [];
			$.each(this.item._algoritms, function(key, ep) {
				var found  = !!($(cur.el).find("input#" + key + ":checkbox:checked").val());
				if (found) {
					cur.item.metadata.provider.algoritms.push(key);
				}
			});



			this.item.metadata.client.client_id = $(this.el).find("input#client_id").val();
			this.item.metadata.client.client_secret = $(this.el).find("input#client_secret").val();
			this.item.metadata.client.auth_type = $(this.el).find("select#auth_type").val();
			this.item.metadata.client.client_type = $(this.el).find("select#client_type").val();
			
			this.adjustUI();

			// console.log("Saving item:");
			// 			console.log(this.item);
			try {
				this.item.save();				
			} catch(e) {
				console.log("could not save sucessfully:");
				console.log(e);
				console.trace();
			}

		}

	});
	OICProviderEditor.include({
		templateID: "oicprovider"
	});
	OICProviderEditor.extend({
		modelType: OICProvider
	});

	
	
	
	
	
	
	var EntityListItem = Spine.Controller.sub({
		tag: "li",
		item: null,
		prepared: null,
		init: function() {
			// this.item.bind("entityactive", this.proxy(this.photoactivated));
			this.item.bind("edit", this.proxy(this.startedit));
			this.item.bind("destroy", this.proxy(this.remove));
			this.item.bind("change", this.proxy(this.prepare));
		},
		prepare: function(item) {


			this.el.html($("#providerItem").tmpl(this.item));
			$(this.el).addClass("autosave");
			setTimeout(this.proxy(function() {
				$(this.el).removeClass("autosave");
			}), 600);
			return this;
		},

		startedit: function(item) {
			// // console.log(item);
			$(this.el).addClass('active');
		},
		
		remove: function() {
			// console.log("Destroy item detected...");
			// console.log(this);
			this.release();
		}
		
		
	});

	var EntityLoader = Spine.Controller.sub({
		events: {
			"click li a.entityOpen": "openentity",
			"click li a.entityDel": "delEntity",
			"click li a.entityDup": "dupEntity",
			"click input[type=submit]": "newEntity"
		},
		items: [],
		init: function(){
			
			if (!this.modelType || typeof this.modelType !== 'function') {
				throw "EntityLoader init() must include a modelType.";
			}
			
			// console.log("Initing EntityLoader()")
			this.modelType.bind("create", this.proxy(this.addOne));
			this.modelType.bind("refresh", this.proxy(this.addAll));
			this.modelType.bind("edit", this.proxy(this.clearActive));
			

		},	
		activated: function() {
			
		},
		clearActive: function() {
			$(this.el).find("ul li").removeClass("active");
		},
		addOne: function(item) {
			var entity = new EntityListItem({item: item});
			$(this.el).find("ul").append(entity.prepare().el);
			this.items.push(entity);

		},
		addAll: function() {
			this.items = [];
			this.modelType.each(this.proxy(this.addOne));
		},
		ready: function() {
			this.items[this.current].item.activate();
		},
		openentity: function(e) {
			// console.log("open entity");
			e.preventDefault();
			$(e.target).tmplItem().data.edit();
			// console.log("/open entity");
		},
		dupEntity: function(e) {
			// console.log("Dup entity");
			e.preventDefault();
			var newentry = $(e.target).tmplItem().data.dup();
			newentry.title = newentry.title + ' (copy)';
			newentry.save();
			
			newentry.edit();
		},
		delEntity: function(e) {
			e.preventDefault();
			$(e.target).tmplItem().data.destroy();
		},
		newEntity: function(e) {
			// console.log("new item");
			e.preventDefault();
			var newentry = new this.modelType();
			// console.log("Brand new item created");
			// 			console.log(newentry);
			newentry.save();
			newentry.edit();
		}
		
	});
	

	var ResultController = Spine.Controller.sub({
		events: {
			"click input.testFlowRun": "run",
			"click input.testFlowSShow": "sshow",
			"click input.testFlowSHide": "shide",
			"click input.testFlowDCShow": "dcshow",
			"click input.testFlowDCHide": "dchide",
			"click input.testFlowOthersShow": "othersshow",
			"click input.testFlowOthersHide": "othershide",
			"click div.testItem": "messageToggle"
		},
		init: function() {
			
			
		},
		getFlow: function(e) {
			var el = $(e.target).closest("div.testFlow");
			return el;
		},
		getTestItem: function(e) {
			var el = $(e.target).closest("div.testItem");
			return el;
		},
		messageToggle: function(e) {
			var ti = this.getTestItem(e);
			ti.toggleClass("showDebugMessage");
		},
		run: function(e) {
			// console.log("Run()");
			var sid = this.getFlow(e).attr("id");
			this.cleanup(sid);
			this.trigger("run", sid);
		},
		othersshow: function(e) {
			this.getFlow(e).removeClass("showOnly");	
			$("div#results").removeClass("hideOthers");	
		},
		othershide: function(e) {
			this.getFlow(e).addClass("showOnly");
			$("div#results").addClass("hideOthers");	
		},		
		sshow: function(e) {
			this.getFlow(e).addClass("successShow");
		},
		shide: function(e) {
			this.getFlow(e).removeClass("successShow");
		},
		dcshow: function(e) {
			this.getFlow(e).addClass("debugShow");
		},
		dchide: function(e) {
			this.getFlow(e).removeClass("debugShow");
		},
		
		escapeHTML: function(str) {
			if (!str) return '';
			return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
		},
		cleanup: function(sid) {
			if (sid) {
				$("div#" + sid).find("div.testFlowResults").empty();
				$("div#" + sid).find("pre.debugConsole").remove();
				$("div#" + sid).
					removeClass("completed").
					removeClass("success").
					removeClass("warning").
					removeClass("error").
					removeClass("critical").
					removeClass("info");
				
			} else {
				$(this.el).find("div.testFlow").each(function(i, item) {
					$(item).find("div.testFlowResults").empty();
					$(item).find("pre.debugConsole").remove();
					$(item).
						removeClass("completed").
						removeClass("success").
						removeClass("error").
						removeClass("warning").
						removeClass("critical").
						removeClass("info");
				});
			}

		},
		
		/*
		 Example of the changes property:
		
			changes = {
				"runBefore": true,
				"lastRun": 387684375,
				"changed": false
			}			
		*/

		updateFlowResults: function(testflow, sid, testresults) {

			console.log("=====> updateFlowResults(" + testflow + ":" + sid + ")");
			console.log(testresults);

			
			var testflowel = $(this.el).find("div#" + sid);
			
			// console.log("Found testflowel"); console.log(testflowel);
			
			testflowel.removeClass("running");
			testflowel.addClass("completed");
			testflowel.addClass(testresults.getStatusTag());

			if (testresults.changes) {
				if (testresults.changes.changed) {
					testflowel.addClass("changed");
				} else {
					testflowel.removeClass("changed");
				}
			}

			testflowel.find("div.lastRunInfo").html(testresults.getRunInfo());

			var testflowresel = testflowel.find("div.testFlowResults");
			
			$.each(testresults.tests, function(i, test) {
				// var status = Math.floor(test.status / 100);
				// test.statusClass = "fail";
				// if (status === 2) test.statusClass = "success";
				// console.log("    <======> Appending Test result");
				// console.log("Check status tag: " + test.getStatusTag());
				var testel = testflowresel.append($("#testItem").tmpl(test));
				// testel.find("pre").html(JSON.stringify(JSON.parse(test.message), undefined, 2));
				// testel.find("pre").html(test.message);

				// syntaxHighlight($item.data.message)  
				// testel.addClass(test.getStatusTag());
			});
			testflowel.append("<pre class=\"debugConsole\">" + this.escapeHTML(testresults.debug) + "</div>");

		},
		
		shaddow: function(testflow, sid, shaddow) {
			if (shaddow) {
				$("div#" + sid).addClass("shaddow");		
			} else {
				$("div#" + sid).removeClass("shaddow");
			}
			
		},
		
		startFlow: function(testflow, sid) {
			this.cleanup(sid);
			$("div#" + sid).addClass("running");

		}
		
		
		
	});
	
	var FedLab = Spine.Controller.sub({
		entityloader: null,
		events: {
			"click input#verifynow": "verify",
			"click input#runall": "runAllFlows",
			"click input#configure": "configure"
		},
		init: function(args){
			var c, newentity;
			
			// console.log("Type and then type.modeltype");
			// console.log(this.type);
			// console.log(this.type.modelType);
			
			this.definitions = null;
			
			this.modelType = this.type.modelType; // was OAuthEntity
			

			
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



			
			// console.log("Got some entity:");
			// console.log(this.modelType.first());
			// console.log(this.modelType);


		},
		userinteraction: function(msg) {
			console.log("User interaction. Current editor item:");
			console.log(this.editor.item);
			this.editor.item.addUserinteraction(msg);
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
		getDefinitions: function() {
			var that = this;
			var postdata = {
				operation: "definitions",
				metadata: this.editor.item.metadata //JSON.parse(JSON.stringify(this.editor.item)),
			};
			$.ajax({
				url: "/api",
				dataType: 'json',
				cache: false,
				type: "POST",
				data: postdata,
				success: function(response) {
					console.log("==> getDefinitions() - API Response");
					if (response.status === "ok") {	
						console.log(response);
						$("div#results").empty();
						
						$.each(response.result, function(sid, item) {
							item.sid = sid;
							// console.log("Item for TestFLow tmpl()");
							// console.log(JSON.parse(JSON.stringify(item)));
							$("div#results").append($("#testFlow").tmpl(item));							
						});
						
						that.definitions = response.result;
						
						// console.log("Got definitions");
						// 						console.log(that.definitions);
						// that.runAllFlows();
						// $("div#results pre").text(response);
					}

				},
				error: function(error) {
					console.log("Error: " + error);
				}
				
			});
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
			
			for (sid in this.definitions) {
				// Do not start on a test flow that has already started..
				if (!this.definitions[sid].started) {

					testflow = this.definitions[sid].id;

					// Check if all dependencies are met, if not, move on to next flow.
					if (this.definitions[sid].depends) {
						if (!this.editor.item.dependenciesMet(this.definitions[sid].depends)) {
							that.resultcontroller.shaddow(testflow, sid, true);
							continue;
						} else {
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
			// this.resultcontroller.cleanup();
			this.controllerbarEnable(false);
			this.runAllFlowsRest();
		},
		runTestFlow: function(sid, callback) {
			var that = this,
				testflowresult;

			if (!this.definitions[sid]) throw {message: "Could not find flow"};
			var testflow = this.definitions[sid].id;

			// console.log("runTestFlow()");
			// console.log(this.editor.item);
			var postdata = {
				operation: "runFlow",
				flow: testflow,
				metadata: this.editor.item.metadata, //JSON.parse(JSON.stringify(this.editor.item)),
				type: "openidconnect"
			};
			// console.log(postdata);
			
			that.resultcontroller.startFlow(testflow, sid);
			
			$.ajax({
				url: "/api",
				dataType: 'json',
				cache: false,
				type: "POST",
				data: postdata,
				success: function(response) {
					console.log("    <======> runTestFlow() API Response ");
					console.log(JSON.parse(JSON.stringify(response)));
					if (response.status === "ok") {
						
						testflowresult = TestFlowResult.build(response.result);
						var changes = that.editor.item.updateResults(testflow, testflowresult);
						testflowresult.changes = changes;
						that.editor.item.save();
						that.resultcontroller.updateFlowResults(testflow, sid, testflowresult);
						that.updateCounter();
						
					}
					if (typeof callback === 'function') callback();
				},
				error: function(error) {
					console.log("Error");
					if (typeof callback === 'function') callback();
				}
				
			});
		},
		configure: function(e) {
			var that = this;
			if (e) {
				e.preventDefault();
				e.stopPropagation();	
			}
			$(this.el).find("div#results").empty();
			that.stateChange("modeEdit");
		},
		verify: function(e) {
			var that = this,
				testflow = "verify",
				sid = "openidconnectverifytestflow";

			
			console.log("About to do verify() - here is the metadata");
			console.log(JSON.stringify(this.editor.item.metadata));

			if (e) {
			
				e.preventDefault();
				e.stopPropagation();
				
			}
			
			// console.log("Verify");
			// 			console.log(this.editor.item);
			var postdata = {
				operation: "verify",
				metadata: this.editor.item.metadata, //JSON.parse(JSON.stringify(this.editor.item)),
				type: "openidconnect"
			};
			// console.log(postdata);
			that.resultcontroller.startFlow(testflow, sid);
			
			$.ajax({
				url: "/api",
				dataType: 'json',
				cache: false,
				type: "POST",
				data: postdata,
				success: function(response) {
					console.log("API Response /Verify");
					console.log(response);
					if (response.status === "ok") {
						// if (response.message) {	
						// 	$("div#results").empty();
						// 	// $(response.message).wrap("<code />").wrap("<pre />").appendTo($("div#results"));
						// 	$("div#results").html("<pre></pre>");
						// 	$("div#results pre").text(response.message);

						testflowresult = TestFlowResult.build(response.result);
						// var changes = that.editor.item.updateResults(testflow, testflowresult);
						// testflowresult.changes = changes;
						// that.editor.item.save();
						that.resultcontroller.updateFlowResults(testflow, sid, testflowresult);

						if (testflowresult.status < 4) {
							that.stateChange("modeTest");
							that.getDefinitions();
							return;
						} else if (testflowresult.status == 5) {
							
							var htmlurl = testflowresult.tests[7].url;
							var htmlbody = testflowresult.tests[7].message;
							console.log("HTML: " + htmlbody);
							console.log(testflowresult.tests);
							// $("iframe").attr('src', "data:text/html," + encodeURI(htmlbody));

							var ia = new UserInteraction(htmlurl, htmlbody);
							ia.bind("userinteraction", that.proxy(that.userinteraction));
							$("body").append(ia.el);
						}



					} else {

						alert("Some serious error occured! should not happen ;-/");

					}
				},
				error: function(error) {
					console.log("Error");
					alert("Some serious error occured! should not happen ;-/");
				}
				
			});
			
			
			// $.getJSON('/api', postdata, function(response) {
			// 	console.log("API Response");
			// 	console.log(response);
			// });
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
			$("div#results").append($("#testFlow").tmpl(verifydef));
			
			// AUTOMATICALLY START VERIFY? For quicker development.
			// this.verify();
			
		}

	});

	exports.FedLab = FedLab;
	// exports.OICEditor = OICEditor;
	exports.OAuthEditor = OAuthEditor;
	exports.OICProviderEditor = OICProviderEditor;
	
	
	
})(jQuery, window);