var 

	// built-in libraries
	fs = require('fs'),

	// Module dependencies.
	express = require('express'),
	// io = require('socket.io'), // for npm, otherwise use require('./path/to/socket.io') 
	
	
	
	// Local libraries.
	testconnector = require('./lib/testconnector.js'),
	interaction = require('./lib/interaction.js'),
	
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

app.get('/saml-sp', function(req, res){
	res.render('saml-sp', {
		title: 'SAML 2.0 Service Provider Testing'
	});
});

app.get('/saml-sp2', function(req, res){
	res.render('saml-sp2', {
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

var t = testconnector.testconnector({"cmd": "/root/fedlab/simplesamlphp-test/modules/fedlab/bin/cmd.php"});

// t.temp("oic-verify", function (msg) {
// 	var url = msg.tests[7].url;
// 	var body = msg.tests[7].message;
// 	var ia = new interaction.InteractiveHTML(body, url);
// 	console.log("About to getInteractive...")
// 	var u = ia.getInteractive(function(msg) {		
// 	});

app.post('/api', function(req, res){
	console.log('Hostname is : ' + req.headers.host);
	t.process(req, res);
});
app.post('/api/results/publish', function(req, res) {
	t.publish(req, res);
});
app.get('/api/results', function(req, res) {
	t.getResults(req, res);
});
app.get('/api/definitions', function(req, res) {
	t.getDefinitions(req, res);
});

app.listen(80);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

