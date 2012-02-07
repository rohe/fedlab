var 

	// built-in libraries
	fs = require('fs'),

	// Module dependencies.
	express = require('express'),
	io = require('socket.io'), // for npm, otherwise use require('./path/to/socket.io') 
	
	
	
	// Local libraries.
	testconnector = require('./lib/testconnector.js'),
	
	// Variables
	io,
	app,
	t;

// Configuration

app = express.createServer();

app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.set('view options', {
		layout: false
	});
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
	app.use(express.errorHandler()); 
});




// Routes
app.get('/', function(req, res){
	res.render('index', {
		title: 'Federation Lab'
	});
});

app.get('/saml-sp', function(req, res){
	res.render('saml-sp', {
		title: 'SAML 2.0 Service Provider Testing'
	});
});

app.get('/connect-provider', function(req, res){
	res.render('connect-provider', {
		title: 'OpenID Connect Provider Testing'
	});
});

app.get('/connect-provider2', function(req, res){
	res.render('connect-provider2', {
		title: 'OpenID Connect Provider Testing'
	});
});


var t = testconnector.testconnector({"cmd": "/root/fedlab/simplesamlphp-test/modules/fedlab/bin/cmd.php"});

// t.temp("oic-code");

app.post('/api', function(req, res){

	t.process(req, res);
	
});

app.listen(80);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);





// // Web Sockets
// io = io.listen(app);
// 
// var config = {
// 	'cmd': '/root/fedlab/simplesamlphp-test/modules/fedlab/bin/cmd.php'
// };
// 
// function ioConnection (socket) {
// 	
// 	console.log('Connected client.')
// 	
// 	socket.on('check', function (data) {
// 		console.log('Check request received.');
// 		t = testconnector.testconnector({"cmd": config["cmd"], "metadata": data["metadata"]});
// 		t.check(function(result, stderr) {
// 			console.log(result);
// 			console.log('Error:');
// 			console.log(stderr);
// 			socket.emit('checkResult', result, stderr);
// 		});
// 	});
// 
// 	socket.on('showList', function (data) {
// 		t = testconnector.testconnector({"cmd": config["cmd"], "metadata": data["metadata"]});
// 		t.getFlows(function(list, stderr) {
// 			console.log(list);
// 			console.log('Error:');
// 			console.log(stderr);
// 			
// 			socket.emit('showListResult', list);
// 		});
// 	});
// 		
// 	socket.on('runTests', function (data) {
// 		
// 		var 
// 			i = 0,
// 			runNext;
// 		
// 		console.log("runTests");
// 		console.log(data);
// 		
// 		
// 		// TODO: This is not very reliable. Should have a helper function to catch timeout and continue if callback is not used...
// 		
// 		function processResults(results) {
// 			var key;
// 			
// 			if (!results['status'] !== 'ok') return;
// 			if (!results['results']) return;
// 			if (!results['flowid']) return;
// 			
// 			for (key in results['results']) {
// 				
// 			}
// 		}
// 		
// 		
// 		runNext = function runNext() {
// 			if (i >= data['flows'].length) return;
// 			console.log('Ready to start test ' + data['flows'][i]);
// 			
// 			socket.emit('runTestStart', data['flows'][i]);
// 			
// 			t.runTest(data['flows'][i], function(results, stderr) {
// 				console.log('Result:');
// 				console.log(results);
// //				if (result) {result['id'] = data['flows'][i]; }; // Fix ID if replaced with something else.
// 				console.log('Error:');
// 				console.log(stderr);
// 				socket.emit('runTestResult', results, stderr);
// 				// if (i < 3) runNext();
// 				runNext();
// 			});
// 			i++;
// 		}
// 
// 		
// 		t = testconnector.testconnector({"cmd": config["cmd"], "metadata": data["metadata"]});
// 		
// 		runNext();
// 		
// 		// for (i = 0; i < data['flows'].length; i++) {
// 		// 	console.log('Ready to start test ' + data['flows'][i]);
// 		// 	// t.runTest(data['flows'][i], function(result, stderr) {
// 		// 	// 	console.log(result);
// 		// 	// 	console.log('Error:');
// 		// 	// 	console.log(stderr);
// 		// 	// 	socket.emit('runTestResult', result);
// 		// 	// });
// 		// }
// 
// 	});
// }
// 
// io.sockets.on('connection', ioConnection);
// 









// metadata.getList(function(metadata) {
// 	console.log('Metadata loaded..');
// 		
// 	store = lookup.setupStorage();
// 	console.log('Store loaded..');
// 	
// 	//store.lookup('NO994558234', function() {}, function() {});
// 
// 	live = new statreader.Listener(false);
// 	live.on('login', function (e) {	
// 		console.log(e);
// //		console.log('Event.');
// 		
// 		try {
// 			if (e['spEntityID'] && services[e['spEntityID']]) {
// 				e.service = services[e['spEntityID']];
// 			}
// 
// 			if (e['feideSchoolList']) {
// 
// 				store.lookup(e['feideSchoolList'][0], function (result) {
// 					if (e.service) result.service = e.service;
// 					socket.sockets.emit('message', result);
// 				}, function(e) {
// 
// 					console.log('Error when looking up orgnr:' + e);
// 
// 				});
// 			} else {
// 				console.log('Fallback not implemented yet.');
// 			}
// 		} catch (e) {
// 			console.log('Error procesing login event: ' + e);
// 		}
// 
// 	});
// 
// 	socket.sockets.on('connection', function (socketx) {	
// 		console.log('Connected new client...');
// 	});
// 
// });


