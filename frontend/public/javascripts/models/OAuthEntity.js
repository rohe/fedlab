define(function(require, exports, module) {
	
	var
		Spine = require('spine'),

		TestEntity = require('./TestEntity');

	var OAuthEntity = TestEntity.sub({
		init: function() {
			if (typeof this.metadata !== 'object') {
				this.metadata = {};
			};
			
			this.metadata.versions = {
				oauth: "2.0"
			};
			
			if (!this.metadata.provider) {
				this.metadata.provider = {};
			}
			// if (!this.metadata.provider.endpoints) {
			// 	this.metadata.provider.endpoints = {};
			// }
			if (!this.metadata.client) {
				this.metadata.client = {
					// "auth_type": "client_secret_basic",
					// "client_type": "confidential",
					// "client_id": FedLabUtils.guid().toLowerCase(),
					"redirect_uris": ["https://%s/authz_cb"]
				};
			}
		}
	});
	OAuthEntity.configure("OAuthEntity");
	
	OAuthEntity.include({
		"_endpoints": {
			"authorization_endpoint": {
				"title": "OAuth Authorization endpoint",
				"descr": "OAuth Provider Authorization endpoint is REQUIRED. Described in " + 
					"<a href=\"http://tools.ietf.org/html/draft-ietf-oauth-v2-22#section-3\">OAuth 2.0 section 3</a>"
			},
			"token_endpoint": {
				"title": "OAuth Token endpoint",
				"descr": "OAuth Provider Token endpoint is REQUIRED. Described in " + 
					"<a href=\"http://tools.ietf.org/html/draft-ietf-oauth-v2-22#section-3\">OAuth 2.0 section 3</a>"
			}
		}
	});
	OAuthEntity.extend(Spine.Model.Local);
	
	return OAuthEntity;


});