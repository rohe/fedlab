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
			
			this.constructor.__super__.init.apply(this, arguments);

		},
		updateModel: function() {
			var cur = this;
			
			var title = $(this.el).find("input#title").val();
			
			if (!this.item.metadata) this.item.metadata = {};
			if (!this.item.metadata.client) this.item.metadata.client = {};
			if (!this.item.metadata.endpoints) this.item.metadata.endpoints = {};
			
			this.item.title = title;
			this.item.metadata.issuer = $(this.el).find("input#issuer").val();
			
			$.each(this.item._endpoints, function(key, ep) {
				var found  = $(cur.el).find("input#" + key + "_endpoint").val();
				if (found !== '') {
					cur.item.metadata.endpoints[key] = found;
				} else {
					delete cur.item.metadata.endpoints[key];
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
	
	var OICEditor = EntityEditor.sub({
		init: function() {
			
			this.constructor.__super__.init.apply(this, arguments);
			
			if (typeof this.type !== 'function') {
				throw 'Missing required property on Editor: type';
			}
			
			// console.log('init() OICEditor');
			
			this.type.fetch();
			this.item = this.type.first();
			
			if (this.item)this.render();
			
			// console.log(this.item);
		},
		render: function() {
			var template = $("#oicprovider").tmpl( this.item );
			this.html( template );
		},
		setEntry: function(item) {
			this.item = item;
		}
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
			e.preventDefault();
			var newentry = new this.modelType();
			newentry.save();
			newentry.edit();
		}
		
	});
	

	
	var FedLab = Spine.Controller.sub({
		entityloader: null,
		init: function(args){
			var c, newentity;
			
			this.modelType = OAuthEntity;
			
			console.log(typeof this.type);
			if (!this.type || !(typeof this.type === 'function')) {
				throw ("type parameter of FedLab() MUST be a descendant of the TestEntity model.");
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
	
	
	
	
})(jQuery, window);