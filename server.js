var http = require('http');
var handle = require('./handlers');
var url = require("url");
var fs = require("fs");

var handles = {};
handles["/"] = handle.index;
handles["/channel"] = handle.showChannel;
handles["/delete"] = handle.deleteRule;
handles["/insert"] = handle.insertRule;
handles["/mon"] = handle.monitor;
handles["/save"] = handle.save;
handles["/load"] = handle.load;
handles["/settings"] = handle.settings;
handles["/chainlist"] = handle.chainList;
handles["/login"] = handle.authMe;
handles["/logout"] = handle.logout;
handles["/users"] = handle.userList;

http.createServer(function handler(req, res) {
    var pathname = url.parse(req.url).pathname;
    
    req.setEncoding("utf8");
    
    if (handles[pathname]) {
        if(handle.isAuth(req)) {
			handles[pathname](req, res);
		}
		else {
			handle.authMe(req, res);
		}
    }
    else {
		var file = "./tpl" + pathname;
		
		fs.exists(file, function(ex) {
			if(ex) {
				fs.readFile(file, [], function(err, data) {
					//res.writeHead(320, {"Content-Type": "text/plain"});
					res.end(data);
				});
			}
			else {
				console.log("No request handler found for " + pathname);
				res.writeHead(404, {"Content-Type": "text/plain"});
				res.write("404 Not found");
				res.end();
			}
		});
    }
}).listen(1337);
console.log('Server running at http://*:1337/');


// ------------------ WebSocket ------------------------------------------------
var proc = require('child_process');
var ws = require("nodejs-websocket");

var server = ws.createServer(function (conn) {

	var log = proc.spawn("tail", ["-f", "/var/log/syslog"]);
	log.stdout.on('data', function (data) {
		conn.sendText(JSON.stringify(data.toString().split("\n")));
	});

	conn.on("close", function (code, reason) {
		log.kill('SIGHUP');
	});
}).listen(8001);
