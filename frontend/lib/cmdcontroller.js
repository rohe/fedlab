var 
	// util  = require('util'),
    spawn = require('child_process').spawn,
	// fs = require('fs'),
	// path = require('path'),
	// crypto = require('crypto'),

	// To be exported
	cmd;

/*
 * Executing a [command] with [parameters].
 * Expecting a JSON on stdout, and text on stderr.
 * When completed, calls callback:
 *   callback( resultJSON, stderrtext, statuscode);
 */
cmd = function(command, parameters, data, callback, errorcallback) {

	var
		cmd,
		stderr = '',
		stdout = '';

	console.log("Executing command: " + command + " " + parameters.join(" "));
		
	cmd = spawn(command, parameters);
	
	

	cmd.stdout.on('data', function (data) {
		stdout += data;
	});
	cmd.stderr.on('data', function (data) {
		stderr += data;
	});
	cmd.on('exit', function (code) {
		var 
			result;

		console.log("Executing command: " + command + " " + parameters.join(" ") + "EXIT " + code);

		if (code === 0) {
			// console.log('about to parse: ' + stdout);
			// console.log('stderr: ' + stderr); return;
			
			// console.log("About to parse: " + stdout);
			try {
				result = JSON.parse(stdout);
				// console.log(stdout);
				// console.log(result);
				callback(result, stderr, 0);
				
			} catch (e) {
				console.log("Error parsing output from stdout: " + e.message);
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



exports.cmd = cmd;