var util  = require('util'),
    spawn = require('child_process').spawn,

	crypto = require('crypto'),


	// To be exported
	testconnector;


testconnector = function (config) {
	
	var 
		my = {},
		execute;
	
	
	/*
	 * Executing a [command] with [parameters].
	 * Expecting a JSON on stdout, and text on stderr.
	 * When completed, calls callback:
	 *   callback( resultJSON, stderrtext, statuscode);
	 */
	execute = function(command, parameters, data, callback) {

		var
			cmd,
			stderr = '',
			stdout = '';

		cmd = spawn(command, parameters);
		
		console.log("Executing command: " + command + " " + parameters.join(" "));

		cmd.stdout.on('data', function (data) {
			stdout += data;
		});
		cmd.stderr.on('data', function (data) {
			stderr += data;
		});
		cmd.on('exit', function (code) {
			var 
				result;

			if (code === 0) {
				// console.log('about to parse: ' + stdout);
				// console.log('stderr: ' + stderr); return;
				
				console.log("About to parse: " + stdout);
				try {
					result = JSON.parse(stdout);
					// console.log(stdout);
					// console.log(result);
					callback(result, stderr, 0);
					
				} catch (e) {
					console.log("Error parsing output from stdout " + e.message);
					callback(null, stderr, code);
				}


			} else {
				callback(null, stderr, code);
			}
			
		});
		if (data !== null) {
			console.log("writing stidin");
			console.log(JSON.stringify(data));
			cmd.stdin.write(JSON.stringify(data));		
		}
		cmd.stdin.end();

		
	}
	
	my.temp = function(testflow) {
		
		var metadata; 

		metadata = {"interaction": {"https://connect.openid4.us/abop/op.php/auth": ["select_form", null], "https://connect.openid4.us/abop/op.php/login": ["select_form", {"_form_pick_": {"control": ["persona", "Default"]}}]}, "client": {"application_name": "OIC test tool", "application_type": "web", "redirect_uri": ["https://smultron.catalogix.se/authz_cb"], "register": true, "contact": ["roland.hedberg@adm.umu.se"]}, "provider": {"version": {"oauth": "2.0", "openid": "3.0"}, "conf_url": "https://connect.openid4.us"}};
		
		execute("/usr/local/bin/oicc.py", ["-J", "-", "-v", testflow], metadata, function(result, stderr, statuscode) {

			console.log("  ===================== JSON output  =====================");
			console.log(result);
			console.log("  ===================== Debug output  =====================");
			console.log(stderr);
			console.log("  ===================== Statuscode  =====================");
			console.log(statuscode);
			
		});
		
		
	}
	
	my.process = function (req, res) {
		var metadata; 
	
		console.log("Received request on the /api");
		console.log(JSON.stringify(req.body, null, 4));
		
		
		metadata = req.body.metadata;
		metadata = {"interaction": {"https://connect.openid4.us/abop/op.php/auth": ["select_form", null], "https://connect.openid4.us/abop/op.php/login": ["select_form", {"_form_pick_": {"control": ["persona", "Default"]}}]}, "client": {"application_name": "OIC test tool", "application_type": "web", "redirect_uri": ["https://smultron.catalogix.se/authz_cb"], "register": true, "contact": ["roland.hedberg@adm.umu.se"]}, "provider": {"version": {"oauth": "2.0", "openid": "3.0"}, "conf_url": "https://connect.openid4.us"}};
		metadata = {"interaction": {"https://connect-op.heroku.com/": ["select_form", {"_form_pick_": {"action": "/connect/fake"}}], "https://connect-op.heroku.com/authorizations/new": ["select_form", {"_form_pick_": {"action": "/authorizations", "class": "approve"}}]}, "client": {"application_name": "OIC test tool", "application_type": "web", "redirect_uri": ["https://smultron.catalogix.se/authz_cb"], "register": true, "contact": ["roland.hedberg@adm.umu.se"]}, "provider": {"version": {"oauth": "2.0", "openid": "3.0"}, "conf_url": "https://connect-op.heroku.com"}};
		metadata = {"interaction": {"https://openidconnect.info/account/login": ["chose", {"path": "/account/fake"}], "https://openidconnect.info/connect/consent": ["select_form", null]}, "client": {"application_name": "OIC test tool", "application_type": "web", "redirect_uri": ["https://smultron.catalogix.se/authz_cb"], "register": true, "contact": ["roland.hedberg@adm.umu.se"]}, "provider": {"version": {"oauth": "2.0", "openid": "3.0"}, "conf_url": "https://openidconnect.info"}};
		
		console.log("Metadata:");
		console.log(metadata);
		
		if (req.body.operation === "verify") {
			
			execute("/usr/local/bin/oicc.py", ["-J", "-", "-v", "oic-code"], metadata, function(result, stderr, statuscode) {

				console.log("Received result.");
				console.log("stdout");
				console.log(result);
				console.log("stderr");
				console.log(stderr);
				console.log("statuscode");
				console.log(statuscode);
				
				if (result !== null && typeof result === "object") {
					
					if (result === null) {
						console.log("result is null");
					}
					
					res.writeHead(200, { 'Content-Type': 'application/json' });   
					result["debug"] = stderr;
					// response.write(
					res.end(JSON.stringify(result));
				} else {

					res.writeHead(200, { 'Content-Type': 'application/json' });   
					res.end(JSON.stringify({"status": "error", "message": stderr}) );
					
				}
				
			});
			
		} else	if (req.body.operation === "definitions") {


			// execute("/bin/cat", ["/root/roland/flow-definitions.json"], null, function(result, stderr, statuscode) {
			execute("/usr/local/bin/oicc.py", ["-l"], null, function(result, stderr, statuscode) {
				
				
				var response = {
					status: "ok"
				};
				
				
				console.log("Received result on stdout");
				console.log(result);

				if (result !== null && typeof result === "object") {

					if (result === null) {
						console.log("result is null");
					}
					response.result = {};
					
					
					result.forEach(function(item) {
						var shasum = crypto.createHash('sha1');
						var sid = null;
						shasum.update("openid:testItem");
						shasum.update(item.id);
						sid = shasum.digest("hex");
						
						response.result[sid] = item;
					});

					res.writeHead(200, { 'Content-Type': 'application/json' });   
					// response.write(
					res.end(JSON.stringify(response));
				} else {

					res.writeHead(200, { 'Content-Type': 'application/json' });   
					res.end(JSON.stringify({"status": "error", "message": stderr}) );

				}

			});
		}  else if (req.body.operation === "runFlow") {
			
			var response = {
				status: "ok"
			};
			
			if (!req.body.flow) {
				res.writeHead(200, { 'Content-Type': 'application/json' });   
				res.end(JSON.stringify({"status": "error", "message": "Missing parameter [flow]"}) );
				return;
			}
			
			// TODO : Validate the flow parameter.
			
			
			execute("/usr/local/bin/oicc.py", ["-J", "-", "-v", "-d", req.body.flow], metadata, function(result, stderr, statuscode) {

				console.log("Received result.");
				console.log("stdout");
				console.log(result);
				console.log("stderr");
				console.log(stderr);
				console.log("statuscode");
				console.log(statuscode);
				
				if (result !== null && typeof result === "object") {
					
					if (result === null) {
						console.log("result is null");
					}
					response.result = result;
					
					res.writeHead(200, { 'Content-Type': 'application/json' });   
					result["debug"] = stderr;
					// response.write(
					res.end(JSON.stringify(response));
				} else {

					res.writeHead(200, { 'Content-Type': 'application/json' });   
					res.end(JSON.stringify({"status": "error", "message": stderr}) );
					
				}
				
			});
		
		
		} else  {
			res.writeHead(200, { 'Content-Type': 'application/json' });   
			res.end(JSON.stringify({"status": "error", "message": "invalid operation"}) );
		}
		
		
		
	};

	my.runTest = function (testname, callback) {
		var
			cmd,
			stderr = '',
			stdout = '';

		cmd = spawn(config['cmd'], ['runTest', testname]);
		
		console.log(config['cmd'] + ' runTest ' + testname);

		cmd.stdout.on('data', function (data) {
			stdout += data;
		});
		cmd.stderr.on('data', function (data) {
			stderr += data;
		});
		cmd.on('exit', function (code) {
			var 
				result;

			if (code === 0) {
				// console.log('about to parse: ' + stdout);
				// console.log('stderr: ' + stderr); return;
				
				result = JSON.parse(stdout);
				console.log(stdout);
				console.log('Testing  ' + testname);

				callback(result, stderr);
			} else {
				callback(null, stderr);
			}
			
		});

		cmd.stdin.write(JSON.stringify({"metadata": config['metadata']}));
		cmd.stdin.end();

	}

	my.check = function (callback) {
		var
			cmd,
			stderr = '',
			stdout = '';

		cmd = spawn(config['cmd'], ['check']);

		cmd.stdout.on('data', function (data) {
			stdout += data;
		});
		cmd.stderr.on('data', function (data) {
			stderr += data;
		});
		cmd.on('exit', function (code) {
			var 
				result;

			if (code === 0) {
				result = JSON.parse(stdout);
				callback(result, null);
			} else {
				callback(null, stderr);				
			}

		});

		cmd.stdin.write(JSON.stringify({"metadata": config['metadata']}));
		cmd.stdin.end();

	}
	
	my.getFlows = function (callback) {
		var
			cmd,
			stderr = '',
			stdout = '';
		
		cmd = spawn(config['cmd'], ['showList']);

		cmd.stdout.on('data', function (data) {
			stdout += data;
		});
		cmd.stderr.on('data', function (data) {
			stderr += data;
		});
		cmd.on('exit', function (code) {
			var 
				result;
			
			if (code === 0) {
				// console.log('about to parse: ' + stdout);
				// console.log('stderr: ' + stderr); return;
				result = JSON.parse(stdout);
				callback(result, null);
			} else {
				callback(null, stderr);				
			}
			
		});

		cmd.stdin.write(JSON.stringify({"metadata": config['metadata']}));
		cmd.stdin.end();
		
	}
	
	return my;
}


exports.testconnector = testconnector;


