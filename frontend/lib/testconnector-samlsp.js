var util  = require('util'),
    spawn = require('child_process').spawn,
	fs = require('fs'),
	path = require('path'),
	crypto = require('crypto'),

	interaction = require('./interaction.js'),


	// To be exported
	testconnectorsaml;


testconnectorsaml = function (config) {
	
	var 
		my = {},
		execute,
		resultsconfig = null,
		samlcmd = config['path'] + 'frontend/simplesamlphp-test/modules/fedlab/bin/cmd.php';



	// fs.readFile(config.path + 'frontend/etc/config.results.js', function (err, data) {
	// 	if (err) {
	// 		console.log("Error reading config results: " + err);
	// 		return null;
	// 	}
	// 	resultsconfig = JSON.parse(data);
	// 	console.log("Successfully read resultsconfig...");
	// 	console.log(resultsconfig);
	// });
	
	
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

		
		console.log("Metadata:");
		console.log(metadata);
		

		if (req.body.operation === "verify") {
			
			execute(samlcmd, ["check"], metadata, function(result, stderr, statuscode) {

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
			execute(samlcmd, ["showList"], metadata, function(result, stderr, statuscode) {
				
				
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
						shasum.update("saml:testItem");
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
			execute(samlcmd, ["runTest", req.body.flow], metadata, function(result, stderr, statuscode) {

				console.log("Received result from " + samlcmd

					);
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


exports.testconnectorsaml = testconnectorsaml;


