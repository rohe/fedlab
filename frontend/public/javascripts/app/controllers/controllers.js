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
			if (this.item.metadata.client.client_secret === '') {
				delete this.item.metadata.client.client_secret;
			}
			this.item.metadata.client.auth_type = $(this.el).find("select#auth_type").val();
			this.item.metadata.client.client_type = $(this.el).find("select#client_type").val();
			this.item.metadata.client.redirect_uris = ["https://%s/authz_cb"];
			
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
	      "blur input[type=text]": "updateModel",
	      "click #userinteraction_reset": "resetInteraction"
	    },
		init: function() {

			if (typeof this.type !== 'function') {
				throw 'Missing required property on Editor: type';
			}			
			this.item.bind("destroy", this.proxy(this.remove));
			this.render();
			this.adjustUI();

		},
		resetInteraction: function() {
			
			delete this.item.metadata.interaction;
			this.item.save();
			this.item.edit();
				
		},
		// This function turns off the endpoints, etc that are not relevant depending on the features
		// turned on.
		adjustUI: function() {
			
			// console.log("Adjusting UI");
			// console.log(this.item);
			
			if (this.item.metadata.features.registration) {
				$(this.el).find("#clientconfiguration").hide();
			} else {
				$(this.el).find("#clientconfiguration").show();
			}
			
			if (this.item.metadata.features.discovery) {
				$(this.el).find("p.p_endpoint").hide();
				$(this.el).find("p#p_dynamic_endpoint").show();
				
			} else {
				$(this.el).find("p.p_endpoint").show();
				$(this.el).find("p#p_dynamic_endpoint").hide();
				
				if (!this.item.metadata.features.sessionmanagement) {
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
			if (!this.item.metadata.features) this.item.metadata.features = {};

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
			
			this.item.metadata.features.discovery = !!($(cur.el).find("input#usediscovery:checkbox:checked").val());
			this.item.metadata.features.registration = !!($(cur.el).find("input#useregistration:checkbox:checked").val());
			this.item.metadata.features.sessionmanagement = !!($(cur.el).find("input#usesessionmanagement:checkbox:checked").val());
			this.item.metadata.features.key_export = !!($(cur.el).find("input#usekeyexport:checkbox:checked").val());
			this.item.metadata.features.use_nonce = !!($(cur.el).find("input#usenonce:checkbox:checked").val());

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
			if (this.item.metadata.client.client_secret === '') {
				delete this.item.metadata.client.client_secret;
			}
			this.item.metadata.client.auth_type = $(this.el).find("select#auth_type").val();
			this.item.metadata.client.client_type = $(this.el).find("select#client_type").val();
			this.item.metadata.client.key_export_url = 'http://%s:8090/';
			this.item.metadata.client.redirect_uris = ["https://%s/authz_cb"];
			
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
			"click #createnewitem": "newEntity"
		},
		items: [],
		init: function(){
			var that = this;

			if (!this.modelType || typeof this.modelType !== 'function') {
				throw "EntityLoader init() must include a modelType.";
			}
			
			// console.log("Initing EntityLoader()")
			this.modelType.bind("create", this.proxy(this.addOne));
			this.modelType.bind("refresh", this.proxy(this.addAll));
			this.modelType.bind("edit", this.proxy(this.clearActive));

			$(this.el).find("#configdrop").bind("dragover", function(e) {
				e.stopPropagation();
				e.preventDefault();
				
			});
			$(this.el).find("#configdrop").bind("dragleave", function(e) {
				e.stopPropagation();
				e.preventDefault();
				
			});

			$(this.el).find("#configexport").bind("click", function(e) {
				var i;
				var obj = [];
				var href = "data:application/octet-stream;charset=utf-8;base64,";

				for(i = 0; i < that.items.length; i++) {
					obj.push(that.items[i].item);
				}
				href += btoa(JSON.stringify(obj));
				$(e.target).attr("href", href);
				console.log("Setting href  " + href);
				// return false;
				// window.location.href = href;
			});



			$(this.el).find("#configexport").bind("dragstart", function(e) {
				var dataTransfer = e.originalEvent.dataTransfer;
				var url = "application/pdf:HTML5CheatSheet.pdf:http://thecssninja.come/demo/gmail_dragout/html5-cheat-sheet.pdf";
				//url = "https://raw.github.com/andreassolberg/DiscoJuice/master/discojuice/discojuice.control.js";

				$(e.target).attr("data-downloadurl", "application/pdf:HTML5CheatSheet.pdf:http://thecssninja.come/demo/gmail_dragout/html5-cheat-sheet.pdf");

				e.stopPropagation();
				e.preventDefault();
				console.log("Drag start...");
				var r = dataTransfer.setData("DownloadURL", url);
				console.log('What: ' + (r ? 'YES': 'NO'));
			});
			$(this.el).find("#configdrop").bind("drop", function(event) {
				
				var dataTransfer = event.originalEvent.dataTransfer;
				var freader;
				var obj;
				event.stopPropagation();
				event.preventDefault();

				if (dataTransfer.files.length > 0) { 
					console.log("Drop event");
					console.log(dataTransfer.files[0]);

					freader = new FileReader();
					freader.onload = function(evt) {  
						var i, newentry;
						try {
							obj = JSON.parse(evt.target.result); // 
							
							for(i = 0; i < obj.length; i++) {
								newentry = new that.modelType(obj[i]);
								console.log(obj[i]);
								console.log(newentry);
								newentry.save();
							}

						} catch(e) {
							alert("Invalid configuration data provided: Cannot import: " + e.message);
						}
					};
					
					freader.readAsText(dataTransfer.files[0]);

					
				}

			});
			

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
			
			if (testresults.tests) {
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
			} else {
				
			}

			testflowel.append("<pre style=\"clear: both\" class=\"clearfix debugConsole\">" + this.escapeHTML(testresults.debug) + "</div>");

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

	exports.EntityLoader = EntityLoader;
	exports.ResultController = ResultController;
	// exports.OICEditor = OICEditor;
	exports.OAuthEditor = OAuthEditor;
	exports.OICProviderEditor = OICProviderEditor;
	
	
	
})(jQuery, window);

