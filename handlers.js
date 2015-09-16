var proc = require('child_process');
var fs = require("fs");
var url = require("url");
var querystring = require("querystring");

module.exports = {
	index: function(req, res) {
		fs.readFile('./tpl/index.html', [], function(err, data) {
			//res.writeHead(320, {"Content-Type": "text/plain"});
			res.end(data);
		});
	},
	
	showChannel: function(req, res) {
		var query = url.parse(req.url).query;
		var args = querystring.parse(query);
		
		var table = "";
		if(args.c == "prerouting" || args.c == "postrouting") {
			table = " -t nat ";
		}
		
		var run = "iptables " + table + " -S " + args.c.toUpperCase();
		proc.exec(run, function(error, stdout, stderr) {
			var arr = stdout.split("\n");
			
			res.end(JSON.stringify(arr));
		});
	},
	
	deleteRule: function(req, res) {
		var query = url.parse(req.url).query;
		var args = querystring.parse(query);
		
		proc.exec("iptables -D " + args.c.toUpperCase() + " " + args.i, function(error, stdout, stderr) {
			module.exports.showChannel(req, res);
		});
	},
	
	insertRule: function (req, res) {
		var query = url.parse(req.url).query;
		
		var body = '';
	    req.on('data', function (data) {
	        body += data;
	    });
	    req.on('end', function () {
	        var post = querystring.parse(body);
	        
	        var rule = post['rule'];
	        console.log(rule);
	    	proc.exec("iptables " + rule, function(error, stdout, stderr) {
	    		if(stderr) {
	    			res.end(stderr);
	    		}
	    		else {
	    			module.exports.showChannel(req, res);
	    		}
	    	});
	    });
	},
	
	replaceRule: function (req, res) {
		var query = url.parse(req.url).query;
		
		var body = '';
	    req.on('data', function (data) {
	        body += data;
	    });
	    req.on('end', function () {
	        var post = querystring.parse(body);
	        
	        var rule = post['rule'];
	        console.log(rule);
	    	proc.exec("iptables -R " + args.i + " " + rule, function(error, stdout, stderr) {
	    		if(stderr) {
	    			res.end(stderr);
	    		}
	    		else {
	    			module.exports.showChannel(req, res);
	    		}
	    	});
	    });
	},
	
	monitor: function(req, res) {
		var query = url.parse(req.url).query;
		var args = querystring.parse(query);
		
		var table = "";
		if(args.c == "prerouting" || args.c == "postrouting") {
			table = " -t nat ";
		}
		
		var run = "iptables " + table + " -L " + args.c.toUpperCase() + " -vn";
		proc.exec(run, function(error, stdout, stderr) {
			var arr = stdout.split("\n");
			
			res.end(JSON.stringify(arr));
		});
	}
};
