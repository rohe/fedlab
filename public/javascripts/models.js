(function (exports) {
	
	var TestEntity = Spine.Model.sub({
		init: function() {
			// this.constructor.__super__.init.apply(this, arguments);
			if (typeof this.metadata !== 'object') {
				this.metadata = {};
			};
			if (!this.metadata.endpoints) {
				this.metadata.endpoints = {};
			}
			if (!this.metadata.client) {
				this.metadata.client = {
					"auth_type": "client_secret_basic",
					"client_type": "confidential",
					"client_id": FedLabUtils.guid().toLowerCase(),
					"redirect_uris": ["https://localhost/callback1", "https://localhost/callback2"]
				};
			}
		}, 
		getTitle: function() {
			if (this.title) return this.title;
			return "Unnamed";
		},
		edit: function() {
			console.log("Entity selected for editing...")
			console.log(this);
			this.trigger("edit");
		}
	});
	TestEntity.configure("TestEntity", "title", "metadata");
	
	var OAuthEntity = TestEntity.sub({
		init: function() {
			this.constructor.__super__.init.apply(this, arguments);
		}
	});
	OAuthEntity.configure("OAuthEntity");
	
	OAuthEntity.include({
		"_endpoints": {
			"authorization": {
				"title": "OAuth Authorization endpoint",
				"descr": "OAuth Provider Authorization endpoint is REQUIRED. Described in " + 
					"<a href=\"http://tools.ietf.org/html/draft-ietf-oauth-v2-22#section-3\">OAuth 2.0 section 3</a>"
			},
			"token": {
				"title": "OAuth Token endpoint",
				"descr": "OAuth Provider Token endpoint is REQUIRED. Described in " + 
					"<a href=\"http://tools.ietf.org/html/draft-ietf-oauth-v2-22#section-3\">OAuth 2.0 section 3</a>"
			}
		}
	});
	

	var OICEntity = OAuthEntity.sub();
	OICEntity.configure("OICEntity");
	
	var SAMLSPEntity = TestEntity.sub();
	SAMLSPEntity.configure("SAMLSPEntity");

	
	OICEntity.extend(Spine.Model.Local);
	SAMLSPEntity.extend(Spine.Model.Local);	
	OAuthEntity.extend(Spine.Model.Local);
	
	exports.TestEntity = TestEntity;
	exports.OICEntity = OICEntity;
	exports.SAMLSPEntity = SAMLSPEntity;
	exports.OAuthEntity = OAuthEntity;
	
	
})(window);