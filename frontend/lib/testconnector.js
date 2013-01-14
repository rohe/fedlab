var 
	util  = require('util'),
	// fs = require('fs'),
	// path = require('path'),
	crypto = require('crypto'),

	cmd = require('./cmdcontroller').cmd,

	interaction = require('./interaction.js'),

	// To be exported
	Testconnector,
	OICTestconnector,
	SAMLTestconnector;


Testconnector = function() {

}


// Testconnector.prototype._verify = function(metadata) {
// };

// Testconnector.prototype._definitions = function(callback, errorcallback) {
// };

// Testconnector.prototype._runFlow = function(metadata, flowid, callback) {
// };



SAMLTestconnector = function(config) {
	this.config = config;

	this.samlcmd = config['path'] + 'frontend/simplesamlphp-test/modules/fedlab/bin/cmd.php';
};
util.inherits(SAMLTestconnector, Testconnector);

SAMLTestconnector.prototype.verify = function(metadata, callback, errorcallback) {
	var that = this;
	cmd(this.samlcmd, ["check"], metadata, function(result, stderr, statuscode) {

		if (result === null) {
			if (typeof errorcallback === 'function') errorcallback(stderr); 
			return;
		}
		result.debug = stderr;
		// var response = {
		// 	result: result,
		// 	debug: stderr
		// };
		callback(result);
	});
};

SAMLTestconnector.prototype.definitions = function(metadata, callback, errorcallback) {
	var that = this;
	cmd(this.samlcmd, ["showList"], metadata, function(result, stderr, statuscode) {

		if (result === null) {
			if (typeof errorcallback === 'function') errorcallback(stderr); 
			return;
		}

		// result.forEach(function(item) {
		// 	var shasum = crypto.createHash('sha1');
		// 	var sid = null;
		// 	shasum.update("openid:testItem");
		// 	shasum.update(item.id);
		// 	sid = shasum.digest("hex");
			
		// 	result[sid] = item;
		// });

		callback(result);

	}, function() {
		console.log("ERROR CALLBACK ON OICTestconnector.prototype.defintions")
	});


};
SAMLTestconnector.prototype.runFlow = function(metadata, flowid, callback, errorcallback) {

	var that = this;
	console.log('OICTestconnector.prototype.runFlow() ' + flowid);

	cmd(this.samlcmd, ["runTest", flowid], metadata, function(result, stderr, statuscode) {


		console.log("Command completed! ")

		if (result === null) {
			errorcallback(stderr); return;
		}

		result.debug = stderr;
		// var response = {
		// 	result: result,
		// 	debug: stderr
		// };
		callback(result);

	}, function() {
		console.log("ERROR CALLBACK ON OICTestconnector.prototype.runF")
	});

};





OICTestconnector = function(config) {
	this.hostname = config.hostname;
	if (!config.hostname) {
		throw "Configuration does not contain a hostname, which is required.";
	}
};
util.inherits(OICTestconnector, Testconnector);


OICTestconnector.prototype.verify = function(metadata, callback, errorcallback) {
	var that = this;
	cmd("/usr/local/bin/oicc.py", ["-J", "-", "-H", this.hostname, "-i", "oic-verify"], metadata, function(result, stderr, statuscode) {

		if (result === null) {
			if (typeof errorcallback === 'function') errorcallback(stderr); 
			return;
		}
		
		result.debug = stderr;

		if (result.status == 5) {
			console.log("interaction needed.")
			var url = result.url;
			var body = result.htmlbody;
			
			var ia = new interaction.InteractiveHTML(body, url);
			console.log("About to getInteractive...")
			// delete response.result.tests;


			console.log(result);
			var u = ia.getInteractive(function(msg, title) {

				// result.tests[7].message = msg;
				result.htmlbody = msg;
				result.title = title;

				// res.writeHead(200, { 'Content-Type': 'application/json' });   
				// result["debug"] = stderr;
				// // response.write(
				// res.end(JSON.stringify(response));
				// result.debug = stderr;
				// var response = {
				// 	result: result,
				// 	debug: stderr
				// };
				callback(result);
			});
			return;
		}


		// var response = {
		// 	result: result,
		// 	debug: stderr
		// };
		callback(result);

	});
}
OICTestconnector.prototype.definitions = function(metadata, callback, errorcallback) {
	var that = this;
	cmd("/usr/local/bin/oicc.py", ["-l"], null, function(result, stderr, statuscode) {

		if (result === null) {
			if (typeof errorcallback === 'function') errorcallback(stderr); 
			return;
		}

		result.forEach(function(item) {
			var shasum = crypto.createHash('sha1');
			var sid = null;
			shasum.update("openid:testItem");
			shasum.update(item.id);
			sid = shasum.digest("hex");
			
			result[sid] = item;
		});

		callback(result);

	});
}
OICTestconnector.prototype.runFlow = function(metadata, flowid, callback, errorcallback) {
	var that = this;
	console.log('OICTestconnector.prototype.runFlow() ' + this.hostname + ' ' + flowid);

	cmd("/usr/local/bin/oicc.py", ["-J", "-", "-H", this.hostname, "-i", "-d", flowid], metadata, function(result, stderr, statuscode) {


		console.log("Command completed! ")

		if (result === null) {
			errorcallback(stderr); return;
		}

		result.debug = stderr;
		callback(response);

	}, function() {
		console.log("ERROR CALLBACK ON OICTestconnector.prototype.runF")
	});
}





exports.Testconnector = Testconnector;
exports.OICTestconnector = OICTestconnector;
exports.SAMLTestconnector = SAMLTestconnector;