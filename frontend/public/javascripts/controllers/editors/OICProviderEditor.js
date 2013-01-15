define(function(require, exports, module) {
		

	var
		Spine = require(),
		OICProviderEditor = require('controllers/editors/OICProviderEditor');

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
			
			// this.item.metadata.features.discovery = !!($(cur.el).find("input#usediscovery:checkbox:checked").val());
			// this.item.metadata.features.registration = !!($(cur.el).find("input#useregistration:checkbox:checked").val());
			// this.item.metadata.features.sessionmanagement = !!($(cur.el).find("input#usesessionmanagement:checkbox:checked").val());
			// this.item.metadata.features.key_export = !!($(cur.el).find("input#usekeyexport:checkbox:checked").val());
			// this.item.metadata.features.use_nonce = !!($(cur.el).find("input#usenonce:checkbox:checked").val());

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

	return OICProviderEditor;
	
});