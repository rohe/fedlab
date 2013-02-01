define(function(require, exports, module) {

	var 
		$ = require('jquery'),

		APIconnector = require('../api/APIconnector'),

		UserInteraction = require('controllers/UserInteraction'),

		Error = require('Error'),

		EditorConnect = require('./editors/EditorConnect'),
		EditorSAMLProvider = require('./editors/EditorSAMLProvider'),
		EditorSAMLConsumer = require('./editors/EditorSAMLConsumer'),
		ConfigurationPane = require('./editors/ConfigurationPane'),

		TestExec = require('controllers/TestExec'),
		TestExecPrepare = require('controllers/TestExecPrepare');

	require('bootstrap');

	var AppTest = function(el) {
		var that = this;

		this.el = el || $("<div></div>");
		this.el.attr('id', 'AppTest');

		this.editormapping = {
			'connect': EditorConnect,
			'saml-sp-solberg': EditorSAMLProvider,
			'saml-idp-hedberg': EditorSAMLConsumer
		};

		this.el.on('showonly', function(e) {
			that.el.children().each(function(i, item) {
				if (item === e.target) {
					$(item).show();
				} else {
					$(item).hide();
				}
			});
		});

		console.log("APP");

		this.routingEnabled = true;
		$(window).bind('hashchange', $.proxy(this.route, this));
		this.route();
	}

	AppTest.prototype.load = function(identifier) {
		var editor;
		this.identifier = identifier;

		this.el.empty();

		if (!this.editormapping[this.identifier]) {
			throw new Error('Unable to find Editor for test type [' + this.identifier+ ']');
		}
		editor = this.editormapping[this.identifier];


		this.configurationpane = new ConfigurationPane(editor);
		this.configurationpane.appendTo(this.el);

		console.log(this.configurationpane, this.configurationpane instanceof ConfigurationPane);

		this.configurationpane.on('verify', this.proxy('verify'));
	}

	AppTest.prototype.route = function() {
		if (!this.routingEnabled) return;
		var hash = window.location.hash;
		if (hash.length < 3) {
			this.setHash('/');
		}
		hash = hash.substr(2);

		var parameters;
		console.log("Routing...", hash);

		if (hash.match(/^\/$/)) {

			// this.el.append('');

		} else if (parameters = hash.match(/^\/post$/)) {

			console.log('ROUTING LOAD /')

		} else if (parameters = hash.match(/^\/([0-9a-z\-]+)$/)) {
			if (!this.editormapping.hasOwnProperty(parameters[1])) {
				this.setHash('/');
				return;
			}

			console.log('ROUTING LOAD ' + parameters[1]);
			this.load(parameters[1]);

		} else {
			console.error('No match found for router...');
		}
	}

	AppTest.prototype.setHash = function(hash) {
		this.routingEnabled = false;
		window.location.hash = '#!' + hash;
		// console.log("Setting hash to " + hash);
		this.routingEnabled = true;
	}

	AppTest.prototype.proxy = function(x) {
		return $.proxy(this[x], this);
	};

	AppTest.prototype.verify = function(data) {

		var 
			that = this,
			// https://connect.openid4.us/
			// m = {"versions":{"oauth":"2.0","openid":"3.0"},"provider":{"supported_response_types":["code","code id_token"],"supported_scopes":["openid"],"algoritms":["HS256"],"issuer":"","dynamic":"https://connect.openid4.us/"},"features":{"discovery":true,"registration":true,"session_management":true,"key_export":true},"client":{"redirect_uris":["https://%s/authz_cb"],"client_id":"","auth_type":"client_secret_basic","client_type":"confidential","key_export_url":"http://%s:8090/"},"interaction":[{"matches":{"url":"https://connect.openid4.us/abop/op.php/auth"},"page-type":"login","control":{"index":0,"type":"form","set":{"username":"alice","password":"wonderland","persist":"on"}}},{"matches":{"url":"https://connect.openid4.us/abop/op.php/login"},"page-type":"user-consent","control":{"index":0,"type":"form","set":{"confirm":"confirmed","agreed":"1","trust":"always"},"click":"confirm"}}]};
			m = {"versions":{"oauth":"2.0","openid":"3.0"},"provider":{"supported_response_types":["code","code id_token"],"supported_scopes":["openid"],"algoritms":["HS256"],"issuer":"","dynamic":"https://connect-op.heroku.com/"},"features":{"discovery":true,"registration":true,"session_management":true,"key_export":true},"client":{"redirect_uris":["https://%s/authz_cb"],"client_id":"","auth_type":"client_secret_basic","client_type":"confidential","key_export_url":"http://%s:8090/"},"interaction":[{"matches":{"url":"https://connect-op.heroku.com/"},"page-type":"other","control":{"index":0,"type":"form","set":{"commit":"Create Fake Account"},"click":"commit"}},{"matches":{"url":"https://connect-op.heroku.com/authorizations/new"},"page-type":"user-consent","control":{"index":0,"type":"form","set":{"commit":"approve"},"click":"commit"}}]};

		console.log("Data", data.metadata);

		this.api = new APIconnector(this.identifier, data.metadata);
		this.prepare = new TestExecPrepare(this.api);
		this.prepare.verify(function (result) {

			if (result instanceof Error) {
				console.error('Error validation: ' + result.getMessage());
			} else if(result instanceof UserInteraction) {

				console.log("User interactio bjectk", result);
				result.appendTo(that.el);
				result.on('userinteraction', function(ia) {
					that.configurationpane.addUserInteraction(ia);
				});
				// result.bind("userinteraction", this.proxy(this.userinteraction));
				// $("body").append(result.el);

			} else if(result instanceof TestExec) {
				that.testexec = result;
				that.testexec.appendTo(that.el);
				that.testexec.el.trigger('showonly');

				that.testexec.on('destroyed', $.proxy(function() {
					that.testexec = null;
					that.configurationpane.el.trigger('showonly');
				}, that));
			} else {
				console.error("Unknown error", result);
			}
		});
	}

	return AppTest;

});