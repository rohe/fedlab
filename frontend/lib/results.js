var util  = require('util'),
    spawn = require('child_process').spawn,
	fs = require('fs'),
	path = require('path'),

	// To be exported
	Results,
	readFileResults;



readFileResults = function(config, type, available, metadata, callback) {

	var 
		resp = {},
		interrupted = false,
		completed = false;

	var complete = function() {
		completed = true;
		console.log("Results() Completed. Returning results...");
		callback(resp);
	}
	var interrupt = function() {
		interrupted = true;
		callback(new Error("Timeout retrieving results.."))
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
		console.log("Timeout reading results....");
	}, 5000);

	for(var i = 0; i < available.length; i++) {
		resp[available[i]] = null;
	}

	for(var i = 0; i < available.length; i++) {
		file = config.path + "frontend/results/" + type + '.' + available[i] + ".js";
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
					console.log("About to parse " + data);
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

}





Results = function(config) {

	

	this.config = config;
	this.resultsconfig = {};

	this.loadConfig();
}

Results.prototype.loadConfig = function() {
	var that = this;
	var resultconfigfile = config.path + 'frontend/etc/config.results.js';
	fs.readFile(resultconfigfile, function (err, data) {
		if (err) {
			console.log("Error reading config results from " + resultconfigfile);
			return null;
		}
		that.resultsconfig = JSON.parse(data);
		console.log("Successfully read resultsconfig...");
		// console.log(that.resultsconfig);
	});
}

Results.prototype.publish = function(type, pin, result, callback) {

	console.log("Client is publishing results...");
	console.log(result);

	if (!this.resultsconfig[pin]) {
		console.log("invalid pincode: " + pin);
		return callback(new Error('Invalid pin code'));
	}

	var filename = config.path + 'frontend/results/' + type + '.' + this.resultsconfig[pin].id + '.js';

	console.log("about to write to " + filename);
	fs.writeFile(filename, JSON.stringify(result), function (err) {
		if (err) {
			return callback(new Error(err));
		}
		return callback({status: 'ok'});
	});

}

Results.prototype.get = function(connector, callback) {
	var 
			// results,
			available = [], 
			metadata = {},
			fname;

	/*
	 * Read through all entries in the configuration that has stored an
	 * result file.
	 */
	for (var key in this.resultsconfig) {
		fname = this.config.path + "frontend/results/" + connector + '.' + this.resultsconfig[key].id + ".js";
		if (fs.existsSync(fname)) {
			// console.log("File " + fname + " found");
			// response.results[resultsconfig[key].id] = 'ok';
			available.push(this.resultsconfig[key].id);
			metadata[this.resultsconfig[key].id] = this.resultsconfig[key];
		} else {
			// console.log("Could not find file [" + fname + "]");
		}
	}
	console.log(available);

	if (available.length < 1) {
		return callback(new Error("No results available"));
	}

	readFileResults(this.config, connector, available, metadata, function(results) {
		return callback(results);
	});

}

Results.publish = function() {

}

exports.Results = Results;











