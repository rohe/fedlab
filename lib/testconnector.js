var util  = require('util'),
    spawn = require('child_process').spawn,

	crypto = require('crypto'),

	interaction = require('./interaction.js'),


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
	
	my.temp = function(testflow, callback) {
		
		var metadata; 

		metadata = {
			// "interaction": {
			// 	"https://www.kodtest.se:8088/authorization": ["select_form",
			// 	{
			// 		"login": "diana",
			// 		"password": "krall"
			// 	}]
			// },
			"client": {
				"application_name": "OIC test tool",
				"application_type": "web",
				"redirect_uris": ["https://smultron.catalogix.se/authz_cb"],
				"register": true,
				"contact": ["roland.hedberg@adm.umu.se"]
			},
			"provider": {
				"version": {
					"oauth": "2.0",
					"openid": "3.0"
				},
				"dynamic": "https://www.kodtest.se:8088/"
			}
		};		
		execute("/usr/local/bin/oicc.py", ["-J", "-", "-v", testflow], metadata, function(result, stderr, statuscode) {

			console.log("  ===================== JSON output  =====================");
			console.log(result);
			console.log("  ===================== Debug output  =====================");
			console.log(stderr);
			console.log("  ===================== Statuscode  =====================");
			console.log(statuscode);


			callback(result);
		});
		
		
	}
	
	my.process = function (req, res) {
		var metadata; 
	
		console.log("Received request on the /api");
		console.log(JSON.stringify(req.body, null, 4));
		
		
		metadata = req.body.metadata;

		metadata = {
			"interaction": {
				"https://connect-op.heroku.com/": ["select_form",
				{
					"_form_pick_": {
						"action": "/connect/fake"
					}
				}],
				"https://connect-op.heroku.com/authorizations/new": ["select_form",
				{
					"_form_pick_": {
						"action": "/authorizations",
						"class": "approve"
					}
				}]
			},
			"client": {
				"application_name": "OIC test tool",
				"application_type": "web",
				"redirect_uris": ["https://smultron.catalogix.se/authz_cb"],
				"register": true,
				"contact": ["roland.hedberg@adm.umu.se"]
			},
			"provider": {
				"version": {
					"oauth": "2.0",
					"openid": "3.0"
				},
				"dynamic": "https://connect-op.heroku.com"
			}
		};
		// metadata = {
		// 	// "interaction": {
		// 	// 	"https://openidconnect.info/account/login": ["chose",
		// 	// 	{
		// 	// 		"path": "/account/fake"
		// 	// 	}],
		// 	// 	"https://openidconnect.info/connect/consent": ["select_form", null]
		// 	// },
		// 	"client": {
		// 		"application_name": "OIC test tool",
		// 		"application_type": "web",
		// 		"redirect_uris": ["https://smultron.catalogix.se/authz_cb"],
		// 		"register": true,
		// 		"contact": ["roland.hedberg@adm.umu.se"]
		// 	},
		// 	"provider": {
		// 		"version": {
		// 			"oauth": "2.0",
		// 			"openid": "3.0"
		// 		},
		// 		"registration_endpoint": "https://uninett.no"
		// 		//"dynamic": "https://openidconnect.info"
		// 	}
		// };

		// metadata = {
		// 	"interaction": {
		// 		"https://connect.openid4.us/abop/op.php/auth": ["select_form", null], 
		// 		"https://connect.openid4.us/abop/op.php/login": 
		// 			["select_form", {"_form_pick_": {"control": ["persona", "Default"]}}
		// 		]
		// 	}, 
		// 	"client": {
		// 		"application_name": "OIC test tool", "application_type": "web", 
		// 		"redirect_uris": ["https://smultron.catalogix.se/authz_cb"], 
		// 		"register": true, "contact": ["roland.hedberg@adm.umu.se"]}, 
		// 	"provider": {
		// 		"version": {"oauth": "2.0", "openid": "3.0"}, 
		// 		"dynamic": "https://connect.openid4.us"
		// 	}
		// };
	
		// metadata = {
		// "interaction": {
		// 	"https://connect.openid4.us/abop/op.php/auth": ["select_form", null], 
		// 	"https://connect.openid4.us/abop/op.php/login": ["select_form", {"_form_pick_": {"control": ["persona", "Default"]}}]}, 
		// 	"client": {
		// 		"application_name": "OIC test tool", 
		// 		"application_type": "web", 
		// 		"redirect_uris": ["https://smultron.catalogix.se/authz_cb"], 
		// 		"register": true, 
		// 		"contact": ["roland.hedberg@adm.umu.se"]}, 
		// 	"provider": {
		// 		"version": {"oauth": "2.0", "openid": "3.0"}, 
		// 		"dynamic": "https://connect.openid4.us"}
		// 	};
		metadata = {
			// "interaction": {
			// 	"https://www.kodtest.se:8088/authorization": ["select_form",
			// 	{
			// 		"login": "diana",
			// 		"password": "krall"
			// 	}]
			// },
			"client": {
				"application_name": "OIC test tool",
				"application_type": "web",
				"redirect_uris": ["https://smultron.catalogix.se/authz_cb"],
				"register": true,
				"contact": ["roland.hedberg@adm.umu.se"]
			},
			"provider": {
				"version": {
					"oauth": "2.0",
					"openid": "3.0"
				},
				"dynamic": "https://www.kodtest.se:8088/"
			}
		};


		metadata = {
			// "interaction": {
			// 	"https://connect.openid4.us/abop/op.php/auth": ["select_form", null], 
			// 	"https://connect.openid4.us/abop/op.php/login": 
			// 		["select_form", {"_form_pick_": {"control": ["persona", "Default"]}}
			// 	]
			// }, 
			"client": {
				"application_name": "OIC test tool", "application_type": "web", 
				"redirect_uris": ["https://smultron.catalogix.se/authz_cb"], 
				"register": true, "contact": ["roland.hedberg@adm.umu.se"]}, 
			"provider": {
				"version": {"oauth": "2.0", "openid": "3.0"}, 
				"dynamic": "https://connect.openid4.us"
			}
		};

		
		console.log("Metadata:");
		console.log(metadata);
		
		if (req.body.operation === "verify") {
			
			execute("/usr/local/bin/oicc.py", ["-J", "-", "-v", "oic-verify"], metadata, function(result, stderr, statuscode) {

				var response = {
					status: "ok"
				};

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



					if (result.status == 5) {
						console.log("interaction needed.")


						var url = result.tests[7].url;
						var body = result.tests[7].message;
						
						var ia = new interaction.InteractiveHTML(body, url);
						console.log("About to getInteractive...")
						var u = ia.getInteractive(function(msg) {

							result.tests[7].message = msg;

							res.writeHead(200, { 'Content-Type': 'application/json' });   
							result["debug"] = stderr;
							// response.write(
							res.end(JSON.stringify(response));
						});

					} else {
						res.writeHead(200, { 'Content-Type': 'application/json' });   
						result["debug"] = stderr;
						// response.write(
						res.end(JSON.stringify(response));
					}


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

	
	return my;
}


exports.testconnector = testconnector;


