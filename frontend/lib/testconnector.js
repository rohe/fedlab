var util  = require('util'),
    spawn = require('child_process').spawn,
	fs = require('fs'),
	path = require('path'),
	crypto = require('crypto'),

	interaction = require('./interaction.js'),


	// To be exported
	testconnector;


testconnector = function (config) {
	
	var 
		my = {},
		execute,
		resultsconfig = null,

		resultconfigfile = config.path + 'frontend/etc/config.results.js';



	fs.readFile(resultconfigfile, function (err, data) {
		if (err) {
			console.log("Error reading config results from " + resultconfigfile);
			return null;
		}
		resultsconfig = JSON.parse(data);
		console.log("Successfully read resultsconfig...");
		console.log(resultsconfig);
	});
	
	
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
					console.log(stdout);
					callback(null, stderr, code);
				}


			} else {
				console.log("Status code of executed script was: " + code);
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

	// my.getDefinitions = function (req, res) {
	// 	var 
	// 		response;

	// 	execute("/usr/local/bin/oicc.py", ["-l"], null, function(result, stderr, statuscode) {

	// 		response = {
	// 			status: "ok"
	// 		};
			
	// 		console.log("Received result on stdout");
	// 		console.log(result);

	// 		if (result !== null && typeof result === "object") {

	// 			if (result === null) {
	// 				console.log("result is null");
	// 			}
	// 			response.result = {};
				
	// 			result.forEach(function(item) {
	// 				var shasum = crypto.createHash('sha1');
	// 				var sid = null;
	// 				shasum.update("openid:testItem");
	// 				shasum.update(item.id);
	// 				sid = shasum.digest("hex");
					
	// 				response.result[sid] = item;
	// 			});

	// 			res.writeHead(200, { 'Content-Type': 'application/json' });   
	// 			// response.write(
	// 			res.end(JSON.stringify(response));
	// 		} else {

	// 			res.writeHead(200, { 'Content-Type': 'application/json' });   
	// 			res.end(JSON.stringify({"status": "error", "message": stderr}) );

	// 		}

	// 	});


	// }
	
	my.getResults = function (req, res) {
		var 
			response,
			available = [], 
			metadata = {},
			fname;

		response = {
			status: "ok"
		}; 

		if (!resultsconfig) {
			res.writeHead(200, { 'Content-Type': 'application/json' });   
			res.end(JSON.stringify({"status": "error", "message": "Results not found..."}) );
		}

		response.results = {};
		for (var key in resultsconfig) {
			fname = "results/" + resultsconfig[key].id + ".js";
			if (path.existsSync(fname)) {
				// console.log("File " + fname + " found");
				// response.results[resultsconfig[key].id] = 'ok';
				available.push(resultsconfig[key].id);
				metadata[resultsconfig[key].id] = resultsconfig[key];
			} else {
				// console.log("Could not find file [" + fname + "]");
			}
		}
		console.log(response);

		if (available.length < 1) {
			res.writeHead(200, { 'Content-Type': 'application/json' });   
			res.end(JSON.stringify({"status": "error", "message": "No results available"}) );
		}


		(function(req, res) {

			var 
				resp = {},
				interrupted = false,
				completed = false;

			var complete = function() {
				completed = true;
				console.log("Results() Completed. Returning results...")
				res.writeHead(200, { 'Content-Type': 'application/json' });   
				response.results = resp;
				res.end(JSON.stringify(response));
			}
			var interrupt = function() {
				interrupted = true;
				res.writeHead(200, { 'Content-Type': 'application/json' });   
				res.end(JSON.stringify({"status": "error", "message": "Timeout retrieving results.."}) );
			}
			var checkComplete = function() {
				for (var key in resp) {
					console.log("Checking [" + key + "]");
					if (resp[key] === null) return;
				}
				if (!interrupted) complete();
			}
			setTimeout(function() {
				if (completed) return;
				interrupted = true;
				interrupt();
				console.log("Timeout reading results....")
			}, 5000);

			for(var i = 0; i < available.length; i++) {
				resp[available[i]] = null;
			}

			for(var i = 0; i < available.length; i++) {
				file = "results/" + available[i] + ".js";
				console.log("About to read " + file);
				fs.readFile(file, "utf8", function (err, data) {

					var lf = file;
					var lid = available[i];
					return function(err, data) {
						if (err) {
							console.log("Error reading " + file);
							delete resp[available[i]];
							return;
						}
						try {
							console.log("=====> DATA")
							console.log(lf);
							console.log(lid);
							console.log(data);
							resp[lid] = metadata[lid];
							resp[lid].data = JSON.parse(data);
							console.log("Success parsing... " + file);
						} catch(e) {
							console.log("Error parsing " + file);
							console.log(e);
							delete resp[available[i]];
							return;
						}
						checkComplete();
					}
				}());
			}

		})(req, res)

	}

	my.publish = function (req, res) {
		var 
			response = {
				status: "ok"
			};

		console.log("Client is publishing results...");
		console.log(req.body.data);


		if (!resultsconfig[req.body.pincode]) {
			console.log("invalid pincode: " + req.body.pincode);
			res.writeHead(200, { 'Content-Type': 'application/json' });   
			res.end(JSON.stringify({"status": "error", "message": "Invalid pin code"}) );
			return;
		}

		var filename = 'results/' + resultsconfig[req.body.pincode].id + '.js';

		console.log("about to write to " + filename);
		fs.writeFile(filename, JSON.stringify(req.body.data), function (err) {
			if (err) {
				console.log("Error writing results file...");
				res.writeHead(200, { 'Content-Type': 'application/json' });   
				res.end(JSON.stringify({"status": "error", "message": stderr}) );
				return;
			}
			console.log('Results file [' + filename + '] is stored..');
			res.writeHead(200, { 'Content-Type': 'application/json' });   
			res.end(JSON.stringify(response) );
		});

	}

	my.process = function (req, res) {
		var metadata, response; 
		var hostname = req.headers.host;

		console.log('Hostname is : ' + hostname);

	
		console.log("Received request on the /api");
		console.log(JSON.stringify(req.body, null, 4));
		
		
		metadata = req.body.metadata;


		// if (metadata.interaction && metadata.interaction['https://www.kodtest.se:8088//authorization']) {
		// 	metadata.interaction['https://www.kodtest.se:8088/authorization'] = metadata.interaction['https://www.kodtest.se:8088//authorization'];
		// }

		
		console.log("Metadata:");
		console.log(metadata);
		

		if (req.body.operation === "verify") {
			
			execute("/usr/local/bin/oicc.py", ["-J", "-", "-H", hostname, "-i", "oic-verify"], metadata, function(result, stderr, statuscode) {

				response = {
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


						var url = result.url;
						var body = result.htmlbody;
						
						var ia = new interaction.InteractiveHTML(body, url);
						console.log("About to getInteractive...")
						// delete response.result.tests;


						console.log(response.result);
						var u = ia.getInteractive(function(msg, title) {


							// result.tests[7].message = msg;
							result.htmlbody = msg;
							result.title = title;

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
		


			// fs.readFile('/etc/passwd', function (err, data) {
			// 	if (err) throw err;
			// 	console.log(data);
			// });



		} else	if (req.body.operation === "definitions") {


			// execute("/bin/cat", ["/root/roland/flow-definitions.json"], null, function(result, stderr, statuscode) {
			execute("/usr/local/bin/oicc.py", ["-l"], null, function(result, stderr, statuscode) {
				
				
				response = {
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
			
			response = {
				status: "ok"
			};
			
			if (!req.body.flow) {
				res.writeHead(200, { 'Content-Type': 'application/json' });   
				res.end(JSON.stringify({"status": "error", "message": "Missing parameter [flow]"}) );
				return;
			}
			
			// TODO : Validate the flow parameter.
			
			
			execute("/usr/local/bin/oicc.py", ["-J", "-", "-H", hostname, "-i", "-d", req.body.flow], metadata, function(result, stderr, statuscode) {

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
		} else if (req.body.operation === "results"){

			my.getResults(req, res);


		
		} else  {
			res.writeHead(200, { 'Content-Type': 'application/json' });   
			res.end(JSON.stringify({"status": "error", "message": "invalid operation"}) );
		}
		
		
		
	};

	
	return my;
}


exports.testconnector = testconnector;


