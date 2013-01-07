var util  = require('util'),
    spawn = require('child_process').spawn,
	fs = require('fs'),
	path = require('path'),
	crypto = require('crypto'),

	interaction = require('./interaction.js'),


	// To be exported
	Results;



Results = function(config) {
	var that = this;
	var resultconfigfile = config.path + 'frontend/etc/config.results.js';

	this.resultsconfig = {};

	fs.readFile(resultconfigfile, function (err, data) {
		if (err) {
			console.log("Error reading config results from " + resultconfigfile);
			return null;
		}
		that.resultsconfig = JSON.parse(data);
		console.log("Successfully read resultsconfig...");
		console.log(resultsconfig);
	});
}

Results.get = function() {

}

Results.publish = function() {

}

exports.Results = Results;


