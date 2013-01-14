var 

	// built-in libraries
	fs = require('fs'),

	// Module dependencies.
	express = require('express'),
	// io = require('socket.io'), // for npm, otherwise use require('./path/to/socket.io') 
	
	
	// Local libraries.
	tests = require('./lib/testconnector.js'),
	// testconnector = require('./lib/testconnector.js'),
	// testconnectorsaml = require('./lib/testconnector-samlsp.js'),
	interaction = require('./lib/interaction.js'),
	
	// Variables
	io,
	app,
	t, ts;



/*
 * Setup Express webserver
 */
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


/*
 * Routes for Express webserver
 */ 
app.get('/', function(req, res){
	res.render('index', {
		title: 'Federation Lab'
	});
});

app.get('/about', function(req, res){
	res.render('about', {
		title: 'About'
	});
});
app.get('/contact', function(req, res){
	res.render('contact', {
		title: 'Contact'
	});
});
app.get('/connect-gettingstarted', function(req, res){
	res.render('connecthowto', {
		title: 'Getting started'
	});
});



app.get('/jwt', function(req, res){
	res.render('jwt', {
		title: 'JWT Tool'
	});
});
app.get('/samldebug', function(req, res){
	res.render('samldebug', {
		title: 'SAML Debugger'
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


app.get('/results', function(req, res){
	res.render('results', {
		title: 'OpenID Connect Provider Test Results'
	});
});


app.get('/test', function(req, res){
	res.render('test', {
		title: 'Test'
	});
});


var configdata = fs.readFileSync(__dirname + '/etc/config.js', 'utf8');
config = JSON.parse(configdata);

// fs.readFile(__dirname + '/etc/config.js', function (err, data) {
// 	if (err) {
// 		console.log("Error reading config results");
// 		return null;
// 	}
// 	config = JSON.parse(data);
// 	console.log("Successfully read configuration.");
// 	console.log(config);

	// t = testconnector.testconnector(config);
	// ts = testconnectorsaml.testconnectorsaml(config);

// });


// t.temp("oic-verify", function (msg) {
// 	var url = msg.tests[7].url;
// 	var body = msg.tests[7].message;
// 	var ia = new interaction.InteractiveHTML(body, url);
// 	console.log("About to getInteractive...")
// 	var u = ia.getInteractive(function(msg) {		
// 	});



/*
 * Setup connectors to test tools
 */

var connectors = {};
connectors.connect = new tests.OICTestconnector(config);
connectors.saml = new tests.SAMLTestconnector(config);


/*
 * API Version 2.0
 */

app.all('/api2/*', function(req, res, next) {

	console.log("API2 Request: ");
	// console.log(req);
	next();
});

app.all('/api2/:type/verify', function(req, res, next) {

	var metadata;

	

	try {

		if (!connectors[req.params.type]) throw 'Invalid connector';
		if (!req.body) throw 'Missing metadata in HTTP Requeset body';
		metadata = req.body;

		connectors[req.params.type].verify(metadata, function(data) {
			req.response = data;	
			next();
		});

	} catch (err) {
		req.error = err;
		next();
	}
	
});

app.all('/api2/:type/definitions', function(req, res, next) {

	var metadata;

	if (!connectors[req.params.type]) {
		req.error = 'Invalid connector';
		next();
	}

	if (!connectors[req.params.type]) throw 'Invalid connector';
	if (!req.body) throw 'Missing metadata in HTTP Requeset body';
	metadata = req.body;

	connectors[req.params.type].definitions(metadata, function(data) {
		req.response = data;	
		next();
	});

});

app.all('/api2/:type/runflow/:flowid', function(req, res, next) {

	var metadata;

	try {

		console.log("API2 Request: runflow ");

		if (!connectors[req.params.type]) throw 'Invalid connector';
		if (!req.body) throw 'Missing metadata in HTTP Requeset body';
		metadata = req.body;

		console.log("API2 Request: runflow " + req.params.flowid);
		console.log("Metadata: " + metadata);

		connectors[req.params.type].runFlow(metadata, req.params.flowid, function(data) {
			console.log("Runflow completed callback()");
			req.response = data;
			next();
		});

	} catch (err) {
		req.error = err;
		next();
	}

});

app.all('/api2/:type/results', function(req, res, next) {

	next();

});

app.all('/api2/*', function(req, res) {

	if (req.response) {
		console.log(" => Response 200 OK");
		res.writeHead(200, { 'Content-Type': 'application/json' });   
		res.end(JSON.stringify(req.response));

	} else if (req.error) {
		console.log(" => Response 200 Error " + req.error);
		res.writeHead(500, { 'Content-Type': 'application/json' });   
		res.end(JSON.stringify({"status": "error", "message": req.error}) );

	} else {
		console.log(" => Response 501 No response");
		res.writeHead(501, { 'Content-Type': 'application/json' });   
		res.end(JSON.stringify({"status": "error", "message": "invalid operation"}) );
	}
	console.log("RESPONSE");

});



/*
 * API
 */ 
app.post('/api', function(req, res){

	console.log('Accessing API on hostname : ' + req.headers.host);
	if (req.body.type === 'saml') {
		ts.process(req, res);
		console.log("Called SAML")
	} else if (req.body.type === 'connect') {
		t.process(req, res);
		console.log("Called Connect");
	} else {
		throw {message: 'invalid type at the API'};
	}
	
});
app.post('/api/results/publish', function(req, res) {
	t.publish(req, res);
});
// app.get('/api/results', function(req, res) {
// 	t.getResults(req, res);
// });
// app.get('/api/definitions', function(req, res) {
// 	t.getDefinitions(req, res);
// });

app.listen(80);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

