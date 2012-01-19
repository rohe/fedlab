var 
	http = require('http'),  
    io = require('socket.io'), // for npm, otherwise use require('./path/to/socket.io') 
	net = require('net'),
	sys = require("sys"),
	
    url = require("url"),
    fs = require("fs"),
    path = require("path"),
    
    port = process.argv[2] || 1337,
	
	server
	;



// Web Server
server = http.createServer(function(request, response) {
	
	var 
		uri = url.parse(request.url).pathname, 
		filename = path.join(process.cwd(), '/files/', uri);
	
	// if(uri === '/data') {
	// 	response.writeHead(200, {"Content-Type": "application/json"});
	// 	response.write(JSON.stringify(statusdata));
	// 	response.end();
	// 	return;	
	// }
	// 
	path.exists(filename, function(exists) {
	
		if(!exists) {
			response.writeHead(404, {"Content-Type": "text/plain"});
			response.write("404 Not Found\n");
			response.end();
			return;
		}
		
		if (fs.statSync(filename).isDirectory()) filename += '/index.html';
		
		fs.readFile(filename, "binary", function(err, file) {
		
			if(err) {        
				response.writeHead(500, {"Content-Type": "text/plain"});
				response.write(err + "\n");
				response.end();
				return;
			}
			
			response.writeHead(200);
			response.write(file, "binary");
			response.end();
			
		});
		
	});
	
}).listen(parseInt(port, 10));

console.log("Static file server running at\n  => http://server:" + port + "/\nCTRL + C to shutdown");








