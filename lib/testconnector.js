var util  = require('util'),
    spawn = require('child_process').spawn,


	// To be exported
	testconnector;



testconnector = function (config) {
	
	var 
		my = {};

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


