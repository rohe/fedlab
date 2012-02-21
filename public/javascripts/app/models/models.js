(function (exports) {
	
	var TestItemResult = Spine.Model.sub({
		init: function() {
			// console.log("initing item"); //console.log(this);
		},
		getStatusTag: function() {

			// console.log("get statustag on [TestItem] " + this.status);
			// console.log(this);

			// return "STATUS:" + this.status;

			if (typeof this.status === undefined || this.status === null) return "info";
			switch(this.status) {
				case 0: return "info";
				case 1: return "success";
				case 2: return "warning";
				case 3: return "error";
				case 4: return "critical";
				default: return "info";
			}
		},
		getMessage: function() {
			if (!this.message) return '';

			return this.message;

			// try {
			// 	return JSON.parse(this.message);
			// } catch(e) {
			// 	return this.message;
			// }
			// return '';
		},
		hasMessage: function() {
			return !!(this.message);
		},
		hasMessageClass: function() {
			return this.hasMessage() ? 'hasMessage' : '';
		}
	});
	TestItemResult.configure("TestItemResult", "tid", "name", "status", "message", "debug");
	// TestItemResult.belongsTo('testflow', TestFlowResult);
	
	var TestFlowResult = Spine.Model.sub({
		init: function(args) {
			// console.log("initing flow"); console.log(args);
		},
		getSimpleResultObj: function() {
			var res = {}, i;
			res.lastRun = Math.round(new Date().getTime());
			res.results = [];
			for (i = 0; i < this.tests.length; i++) {
				// console.log("Adding a new result item: ")
				// console.log(this.tests[i]);
				res.results.push(this.tests[i].status);
			} 
			res.status = this.status;
			return res;
		},
		getRunInfo: function() {
			
			var t;

			if (!this.changes) return '';

			t = '<p>Last run <span class="lastRunDate" title="' + this.changes.thisRun + '">' + prettyDate(this.changes.thisRun) + '</span>';

			if (this.changes.lastRun) {
				t += ', and the previous one ran ' + prettyInterval(this.changes.thisRun - this.changes.lastRun) + ' that';
			}
			t += '.</p>';

			if (this.changes.changed) {
				t += '<p><img src="/images/bell.png" /> The results differ!</p>';
			} else {
				// t += '<p>The result was not changed.</p>';
			}

			return t;
		},
		getStatusTag: function() {
			// console.log("get statustag on [TestFlow] " + this.status);			
			switch(this.status) {
				case 0: return "info";
				case 1: return "success";
				case 2: return "warning";
				case 3: return "error";
				case 4: return "critical";
				default: return "info";
			}
		}
	});
	TestFlowResult.extend({
		// Compares two result arrays
		compare: function(r1, r2) {
			var i,
				a1 = r1.results,
				a2 = r2.results;
			
			if (r1.status !== r2.status) return false;
			if (a1.length !== a2.length) return false;
			for(i = 0; i < a1.length; a1++) {
				if (a1[i] !== a2[i]) return false;
			}
			return true;
		}
	});
	TestFlowResult.extend({
		
		// Takes an testflow result object and transforms to a model.
		build: function(obj) {
			var id, tests;
			
			id = obj.id; delete obj.id;
			tests = obj.tests; delete obj.tests;
			
			obj.fid = id;
			
			var result = this.create(obj);
			var testresults = [];
			
			if (tests) {
				for(var i = 0; i < tests.length; i++) {
					testresults.push(new TestItemResult(tests[i]));
				}
				result.tests = testresults;
			}
			result.save();
			return result;			
		}
	})
	TestFlowResult.configure("TestFlowResult", "fid", "status", "tests", "debug", "changes");
	// TestFlowResult.hasMany('_hasManyTests', TestItemResult);
	
	
	
	var TestEntity = Spine.Model.sub({
		init: function() {
			// this.constructor.__super__.init.apply(this, arguments);
			if (typeof this.metadata !== 'object') {
				this.metadata = {};
			};
			if (typeof this.results !== 'object') {
				this.results = {};
			};
		}, 
		addUserinteraction: function(msg) {
			if (!this.metadata.userinteraction) {
				this.metadata.userinteraction = [];
			}
			this.metadata.userinteraction.push(msg);
			console.log("addUserinteraction() Metadata:");
			console.log(this.metadata);
		},
		
		/*
		 	Example of this.results
		
			{
				"testflowid": {
					"lastRun": 982347923,
					"result": [0, 2, 3, 2, 1, 0]
				},
				"testflowid2": {
					"lastRun": 
				}
			}
		 */
		updateResults: function(testflow, testresult) {
			var oldresult, newresult, changes;
			if (!this.results) this.results = {};
			oldresult = this.results[testflow];
			
			newresult = testresult.getSimpleResultObj();
			this.results[testflow] = newresult;
			
			if (typeof oldresult === "undefined") {
				changes = {
					"runBefore": false
				};
			} else {
				// console.log("Run before run now")
				// console.log(testresult)
				// console.log(oldresult.results);
				// console.log(newresult.results);
				changes = {
					"runBefore": true,
					"lastRun": oldresult.lastRun,
					"changed": !TestFlowResult.compare(oldresult, newresult)
				}
				// changes.changed = !!(Math.random() > 0.7);
			}
			changes.thisRun = newresult.lastRun;
			// console.log("Updating results");
			// console.log(JSON.parse(JSON.stringify(this)));
			return changes;
		},

		countResults: function() {
			var key, i,
				aggr = [0,0,0,0,0];

			for(key in this.results) {
				for (i = 0; i < this.results[key].results.length; i++) {
					aggr[this.results[key].results[i]]++;
				}
			}
			return aggr;
		},

		dependenciesMet: function(depends) {
			var i;
			for(i = 0; i < depends.length; i++) {
				if (!this.results[depends[i]]) return false;
				if (this.results[depends[i]].status !== 4) return false;
			}
			return true;
		},
		
		getTitle: function() {
			if (this.title) return this.title;
			return "Unnamed";
		},
		edit: function() {
			// console.log("Entity selected for editing...")
			// console.log(this);
			// console.trace()
			this.trigger("edit");
		}
	});
	TestEntity.configure("TestEntity", "title", "metadata", "results");
	
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
			if (!this.metadata.provider.endpoints) {
				this.metadata.provider.endpoints = {};
			}
			if (!this.metadata.client) {
				this.metadata.client = {
					"auth_type": "client_secret_basic",
					"client_type": "confidential",
					"client_id": FedLabUtils.guid().toLowerCase(),
					"redirect_uris": ["https://localhost/callback1", "https://localhost/callback2"]
				};
			}
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
	

	var OICProvider = OAuthEntity.sub({
		init: function() {
			if (typeof this.metadata !== 'object') {
				this.metadata = {};
			};
			
			this.metadata.versions = {
				oauth: "2.0",
				openid: "3.0"
			};
			
			if (!this.metadata.provider) {
				this.metadata.provider = {};
			}
			
			if (!this.metadata.provider.features) {
				this.metadata.provider.features = {
					"discovery": false,
					"registration": false,
					"sessionmanagement": false
				};
			}
			this.metadata.provider.supported_response_types = ["code", "code id_token", "token id_token"];
			this.metadata.provider.supported_scopes = ["openid"];
			this.metadata.provider.algoritms = ["HS256"];
			
			if (!this.metadata.provider.endpoints) {
				this.metadata.provider.endpoints = {};
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
		"hasAlg": function(alg) {
			var has = false;
			$.each(this.metadata.provider.algoritms, function(i, ha) {
				if (ha === alg) has = true;
			});
			return has;
		},
		"hasScope": function(scope) {
			var has = false;
			$.each(this.metadata.provider.supported_scopes, function(i, hs) {
				if (hs === scope) has = true;
			});
			return has;
		},
		"hasResponseType": function(rt) {
			var has = false;
			$.each(this.metadata.provider.supported_response_types, function(i, hrt) {
				if (rt === hrt) has = true;
			});
			return has;
		}
	});	
	OICProvider.configure("OICProvider");
	OICProvider.include({
		"_endpoints": {
			"discovery": {
				"title": "OpenID Connect Discovery Endpoint",
				"descr": "An e-mail address or a URL endpoint for the purpose of OpenID Connect Discovery. See " + 
					"<a target=\"_blank\" href=\"http://openid.net/specs/openid-connect-discovery-1_0.html\">OpenID Connect Discovery</a> for more details."
			},
			"authorization": {
				"title": "OAuth Authorization endpoint",
				"descr": "OAuth Provider Authorization endpoint is REQUIRED. Described in " + 
					"<a target=\"_blank\" href=\"http://tools.ietf.org/html/draft-ietf-oauth-v2-22#section-3\">OAuth 2.0 section 3</a>"
			},
			"token": {
				"title": "OAuth Token endpoint",
				"descr": "OAuth Provider Token endpoint is REQUIRED. Described in " + 
					"<a target=\"_blank\" href=\"http://tools.ietf.org/html/draft-ietf-oauth-v2-22#section-3\">OAuth 2.0 section 3</a>"
			},
			"registration": {
				"title": "Registration Endpoint",
				"descr": "The OpenID Connect UserInfo Endpoint is described in " + 
					"<a target=\"_blank\" href=\"http://openid.net/specs/openid-connect-registration-1_0.html\">OpenID Connect Dynamic Client Registration</a>"
			},
			"userinfo": {
				"title": "UserInfo Endpoint",
				"descr": "The OpenID Connect UserInfo Endpoint is described in " + 
					"<a target=\"_blank\" href=\"http://openid.net/specs/openid-connect-standard-1_0.html#userinfo_ep\">OpenID Connect Standard - Section 5</a>"
			},
			"check_id": {
				"title": "CheckID Endpoint",
				"descr": "The OpenID Connect CheckID Endpoint is described in " + 
					"<a target=\"_blank\" href=\"http://openid.net/specs/openid-connect-standard-1_0.html#check_id_ep\">OpenID Connect Standard - Section 4</a>"
			},
			"refresh_session": {
				"title": "Refresh Session endpoint",
				"descr": "The OpenID Connect Refresh Session Endpoint is described in " + 
					"<a target=\"_blank\" href=\"http://openid.net/specs/openid-connect-session-1_0.html\">OpenID Connect Session Management</a>"
			},
			"end_session": {
				"title": "End Session endpoint",
				"descr": "The OpenID Connect End Session Endpoint is described in " + 
					"<a target=\"_blank\" href=\"http://openid.net/specs/openid-connect-session-1_0.html\">OpenID Connect Session Management</a>"
			},
		},
		"_algoritms": {
			"HS256": {
				"title": "HMAC SHA-256",
				"descr": "HMAC using SHA-256 hash algorithm"
			},
			"HS384": {
				"title": "HMAC SHA-384",
				"descr": "HMAC using SHA-384 hash algorithm"
			},
			"HS512": {
				"title": "HMAC SHA-512",
				"descr": "HMAC using SHA-512 hash algorithm"
			},
			"RS256": {
				"title": "RSA SHA-256",
				"descr": "RSA using SHA-256 hash algorithm"
			},
			"RS384": {
				"title": "RSA SHA-384",
				"descr": "RSA using SHA-384 hash algorithm"
			},
			"RS512": {
				"title": "RSA SHA-512",
				"descr": "RSA using SHA-512 hash algorithm"
			},
			"ES256": {
				"title": "ECDSA (SHA-256)",
				"descr": "RSA using SHA-256 hash algorithm"
			},
			"ES384": {
				"title": "ECDSA (SHA-384)",
				"descr": "RSA using SHA-384 hash algorithm"
			},
			"ES512": {
				"title": "ECDSA (SHA-512)",
				"descr": "RSA using SHA-512 hash algorithm"
			},
			"ES512": {
				"title": "ECDSA (SHA-512)",
				"descr": "RSA using SHA-512 hash algorithm"
			},
			"RSA1_5": {
				"title": "RSA1_5",
				"descr": "RSA using RSA-PKCS1-1.5 padding, as defined in RFC 3447 [RFC3447]"
			},


			"RSA1_5": {
				"title": "RSA1_5",
				"descr": "RSA using RSA-PKCS1-1.5 padding, as defined in RFC 3447 [RFC3447]"
			},
			"RSA-OAEP": {
				"title": "RSA-OAEP",
				"descr": "RSA using Optimal Asymmetric Encryption Padding (OAEP), as defined in RFC 3447 [RFC3447]"
			},

			"ECDH-ES": {
				"title": "ECDH-ES",
				"descr": "Elliptic Curve Diffie-Hellman Ephemeral Static, as defined in RFC 6090 [RFC6090], and using the Concat KDF, as defined in [NIST-800-56A], where the Digest Method is SHA-256"
			},
			"A128KW": {
				"title": "A128KW",
				"descr": "Advanced Encryption Standard (AES) Key Wrap Algorithm using 128 bit keys, as defined in RFC 3394 [RFC3394]"
			},	
			"A256KW": {
				"title": "A256KW",
				"descr": "Advanced Encryption Standard (AES) Key Wrap Algorithm using 256 bit keys, as defined in RFC 3394 [RFC3394]"
			},		

			"A128GCM": {
				"title": "A128GCM",
				"descr": "Advanced Encryption Standard (AES) using 128 bit keys in Galois/Counter Mode, as defined in [FIPS-197] and [NIST-800-38D]"
			},
			"A256GCM": {
				"title": "A256GCM",
				"descr": "Advanced Encryption Standard (AES) using 256 bit keys in Galois/Counter Mode, as defined in [FIPS-197] and [NIST-800-38D]"
			},
			"A128CBC": {
				"title": "A128CBC",
				"descr": "Advanced Encryption Standard (AES) using 128 bit keys in Cipher Block Chaining mode, as defined in [FIPS-197] and [NIST-800-38A]  "
			},
			"A256CBC": {
				"title": "A256CBC",
				"descr": "Advanced Encryption Standard (AES) using 256 bit keys in Cipher Block Chaining mode, as defined in [FIPS-197] and [NIST-800-38A]  "
			},
			"A128GCM": {
				"title": "A128CBC",
				"descr": "Advanced Encryption Standard (AES) using 128 bit keys in Galois/Counter Mode, as defined in [FIPS-197] and [NIST-800-38D]"
			},
			"A256GCM": {
				"title": "A256GCM",
				"descr": "Advanced Encryption Standard (AES) using 256 bit keys in Galois/Counter Mode, as defined in [FIPS-197] and [NIST-800-38D]"
			}
		},
		"_scopes": {
			"profile": {
				"descr": "OPTIONAL. This requests that access to the End-User's profile Claims excluding the address and email Claims at the UserInfo Endpoint be granted by the issued Access Token."
			},
			"email": {
				"descr": "OPTIONAL. This requests that access to the email and verified Claims at the UserInfo Endpoint be granted by the issued Access Token."
			},
			"address": {
				"descr": "OPTIONAL. This requests that access to address Claim at the UserInfo Endpoint be granted by the issued Access Token."
			},
			"phone": {
				"descr": "OPTIONAL. This requests that access to the phone_number Claim at the UserInfo Endpoint be granted by the issued Access Token."
			}
		},
		"_response_types": {
			"code": {
				"title": "code"
			},
			"token": {
				"title": "token"
			},
			"code__token": {
				"title": "code token"
			},
			"code__id_token": {
				"title": "code id_token"
			},
			"id_token__token": {
				"title": "id_token token"
			},
			"code__id_token__token": {
				"title": "code id_token token"
			}
		}
	});
	
	
	
	
	var SAMLSPEntity = TestEntity.sub();
	SAMLSPEntity.configure("SAMLSPEntity");

	
	OICProvider.extend(Spine.Model.Local);
	SAMLSPEntity.extend(Spine.Model.Local);	
	OAuthEntity.extend(Spine.Model.Local);
	
	exports.TestEntity = TestEntity;
	exports.OICProvider = OICProvider;
	exports.SAMLSPEntity = SAMLSPEntity;
	exports.OAuthEntity = OAuthEntity;
	
	exports.TestItemResult = TestItemResult;
	exports.TestFlowResult = TestFlowResult;
	
	
})(window);