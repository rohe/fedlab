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
			// console.log("Render() with template ID " + this.templateID);
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
			if (!this.item.metadata.provider.endpoints) this.item.metadata.provider.endpoints = {};


			
			this.item.title = title;
			this.item.metadata.provider.issuer = $(this.el).find("input#issuer").val();
			
			$.each(this.item._endpoints, function(key, ep) {
				var found  = $(cur.el).find("input#" + key + "_endpoint").val();
				if (found !== '') {
					cur.item.metadata.provider.endpoints[key] = found;
				} else {
					delete cur.item.metadata.provider.endpoints[key];
				}
			});

			this.item.metadata.client.client_id = $(this.el).find("input#client_id").val();
			this.item.metadata.client.client_secret = $(this.el).find("input#client_secret").val();
			this.item.metadata.client.auth_type = $(this.el).find("select#auth_type").val();
			this.item.metadata.client.client_type = $(this.el).find("select#client_type").val();
			
			console.log("Saving item:");
			console.log(this.item);
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
			if (!this.item.metadata.provider.endpoints) this.item.metadata.provider.endpoints = {};
			if (!this.item.metadata.provider.features) this.item.metadata.provider.features = {};

			this.item.title = title;
			this.item.metadata.provider.issuer = $(this.el).find("input#issuer").val();

			$.each(this.item._endpoints, function(key, ep) {
				var found  = $(cur.el).find("input#" + key + "_endpoint").val();
				if (found !== '') {
					cur.item.metadata.provider.endpoints[key] = found;
				} else {
					delete cur.item.metadata.provider.endpoints[key];
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

			console.log("Saving item:");
			console.log(this.item);
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
			console.log("open entity");
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
			console.log("new item");
			e.preventDefault();
			var newentry = new this.modelType();
			console.log("Brand new item created");
			console.log(newentry);
			newentry.save();
			newentry.edit();
		}
		
	});
	

	
	var FedLab = Spine.Controller.sub({
		entityloader: null,
		events: {
			"click input#verifynow": "verify"
		},
		init: function(args){
			var c, newentity;
			
			// console.log("Type and then type.modeltype");
			// console.log(this.type);
			// console.log(this.type.modelType);
			
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
				// this.modelType.first().edit();
			}
			// console.log("Got some entity:");
			// console.log(this.modelType.first());
			// console.log(this.modelType);


		},
		getDefinitions: function() {
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
					console.log("API Response");
					if (response) {	
						console.log(response);
						$("div#results").empty();
						$("div#results").append($("#testItem").tmpl(response));
						$("div#results pre").text(response);
					} 
				},
				error: function(error) {
					console.log("Error: " + error);
				}
				
			});
		},
		verify: function(e) {
			var that = this;
			
			e.preventDefault();
			e.stopPropagation();
			
			console.log("Verify");
			console.log(this.editor.item);
			var postdata = {
				operation: "verify",
				metadata: this.editor.item.metadata, //JSON.parse(JSON.stringify(this.editor.item)),
				type: "openidconnect"
			};
			console.log(postdata);
			
			$.ajax({
				url: "/api",
				dataType: 'json',
				cache: false,
				type: "POST",
				data: postdata,
				success: function(response) {
					console.log("API Response");
					console.log(response);
					if (response.status === "error") {
						if (response.message) {	
							$("div#results").empty();
							// $(response.message).wrap("<code />").wrap("<pre />").appendTo($("div#results"));
							$("div#results").html("<pre></pre>");
							$("div#results pre").text(response.message);
						} 
					} else {
						that.getDefinitions();
					}
				},
				error: function(error) {
					console.log("Error");
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
		}

	});

	exports.FedLab = FedLab;
	// exports.OICEditor = OICEditor;
	exports.OAuthEditor = OAuthEditor;
	exports.OICProviderEditor = OICProviderEditor;
	
	
	
})(jQuery, window);