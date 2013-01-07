var 
	util  = require('util'),
	// fs = require('fs'),
	// path = require('path'),
	crypto = require('crypto'),

	cmd = require('./cmdcontroller').cmd,


	// To be exported
	Testconnector,
	OICTestconnector;


Testconnector = function() {

}


Testconnector.prototype._verify = function(metadata) {
};

Testconnector.prototype._definitions = function(callback, errorcallback) {
};

Testconnector.prototype._runFlow = function(metadata, flowid, callback) {
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
			errorcallback(stderr); return;
		}

		var response = {
			result: result,
			debug: stderr
		};
		callback(response);

	});
}
OICTestconnector.prototype.definitions = function(callback, errorcallback) {
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
	cmd("/usr/local/bin/oicc.py", ["-J", "-", "-H", this.hostname, "-i", "-d", req.body.flow], metadata, function(result, stderr, statuscode) {

		if (result === null) {
			errorcallback(stderr); return;
		}

		var response = {
			result: result,
			debug: stderr
		};
		callback(response);

	});
}





exports.Testconnector = Testconnector;
exports.OICTestconnector = OICTestconnector;