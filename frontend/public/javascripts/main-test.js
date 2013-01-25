define(function(require, exports, module) {
	
	var 
		$ = require('jquery'),
		Spine = require('spine'),

		APIconnector = require('./api/APIconnector'),

		OICProviderEditor = require('controllers/editors/OICProviderEditor'),
		EntityLoader = require('controllers/editors/EntityLoader'),

		ResultController = require('controllers/ResultController'),
		PublishController = require('controllers/PublishController'),

		OICProvider = require('models/OICProvider'),
		TestFlowResult = require('models/TestFlowResult'),
		TestItemResult = require('models/TestItemResult'),

		UserInteraction = require('controllers/UserInteraction'),

		prettydate = require('lib/prettydate/pretty'),
		syntaxHighlight = require('lib/syntaxhighlight'),

		TestExec = require('controllers/TestExec'),
		TestExecPrepare = require('controllers/TestExecPrepare');

		require('bootstrap');

	var m = {"versions":{"oauth":"2.0","openid":"3.0"},"provider":{"supported_response_types":["code","code id_token"],"supported_scopes":["openid"],"algoritms":["HS256"],"issuer":"","dynamic":"https://connect.openid4.us/"},"features":{"discovery":true,"registration":true,"session_management":true,"key_export":true},"client":{"redirect_uris":["https://%s/authz_cb"],"client_id":"","auth_type":"client_secret_basic","client_type":"confidential","key_export_url":"http://%s:8090/"},"interaction":[{"matches":{"url":"https://connect.openid4.us/abop/op.php/auth"},"page-type":"login","control":{"index":0,"type":"form","set":{"username":"alice","password":"wonderland","persist":"on"}}},{"matches":{"url":"https://connect.openid4.us/abop/op.php/login"},"page-type":"user-consent","control":{"index":0,"type":"form","set":{"confirm":"confirmed","agreed":"1","trust":"always"},"click":"confirm"}}]};

	var api = new APIconnector("connect", m);


	var prepare = new TestExecPrepare(api);
	prepare.verify(function (result) {
		if (result instanceof Error) {
			console.error('Error validation: ' + result.getMessage());
		} else if(result instanceof TestExec) {

			result.appendTo($("div#results"));
		} else {
			console.error("Unknown error", result);
		}
	});

});