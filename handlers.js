var proc = require('child_process');
var fs = require("fs");
var url = require("url");
var querystring = require("querystring");

module.exports = {
	
	settingsDir: "/etc/iptables/config.json",
	_settings: {
		savePath: "/etc/iptables/rules.save",
		LANS: {}
	},
	
	loadSettings: function() {
		fs.exists(this.settingsDir, function(ex){
			if(ex) {
				fs.readFile(module.exports.settingsDir, [], function(err, data) {
					module.exports._settings = JSON.parse(data);
					console.log("Load settings from " + module.exports.settingsDir);
				});
			}
		});
	},
	
	saveSettings: function() {
		fs.writeFile(this.settingsDir, JSON.stringify(this._settings), function(err) {
			if(err) {
				return console.log(err);
			}

			console.log("The file was saved!");
		});
	},
	
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
		if(args.c === "prerouting" || args.c === "postrouting") {
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
		
		var table = "";
		if(args.c === "prerouting" || args.c === "postrouting") {
			table = " -t nat ";
		}
		
		proc.exec("iptables " + table + " -D " + args.c.toUpperCase() + " " + args.i, function(error, stdout, stderr) {
			module.exports.showChannel(req, res);
		});
	},
	
	insertRule: function (req, res) {
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
	
	monitor: function(req, res) {
		var query = url.parse(req.url).query;
		var args = querystring.parse(query);
		
		var table = "";
		if(args.c === "prerouting" || args.c === "postrouting") {
			table = " -t nat ";
		}
		
		var run = "iptables " + table + " -L " + args.c.toUpperCase() + " -vn";
		proc.exec(run, function(error, stdout, stderr) {
			var arr = stdout.split("\n");
			
			res.end(JSON.stringify(arr));
		});
	},
    
    save: function(req, res) {
        proc.exec("iptables-save > " + module.exports._settings.savePath, function(error, stdout, stderr) {

			res.end(stderr);
		});
    },
	
	settings: function(req, res) {
		var query = url.parse(req.url).query;
		var args = querystring.parse(query);
		
		if(args.c === "save") {
			module.exports.saveSettings();
			res.end();
		}
		else {
			console.log(module.exports._settings);
			res.end(JSON.stringify(module.exports._settings));
		}
	}
};

module.exports.loadSettings();