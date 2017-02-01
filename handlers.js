var proc = require('child_process');
var fs = require("fs");
var url = require("url");
var querystring = require("querystring");

module.exports = {
	
	auth: false,
	authUsers: {},
	
	settingsDir: "/etc/iptables/config.json",
	_settings: {
		savePath: "/etc/iptables/rules.save",
		user: "admin",
		pass: "",
		theme: "Silver",
		themes: []
	},
	
	loadSettings: function() {
		fs.exists(this.settingsDir, function(ex){
			if(ex) {
				fs.readFile(module.exports.settingsDir, [], function(err, data) {
					// Restore new settings after load from file
					var s = module.exports._settings;
					module.exports._settings = JSON.parse(data);
					for(var key in s) {
						if(!module.exports._settings[key]) {
							module.exports._settings[key] = s[key];
						}
					}
					module.exports.auth = module.exports._settings.pass === "";
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

		var run = "iptables -t " + args.t + " -S " + args.c.toUpperCase();
		proc.exec(run, function(error, stdout, stderr) {
			var arr = stdout.split("\n");
			
			res.end(JSON.stringify(arr));
		});
	},
	
	deleteRule: function(req, res) {
		var query = url.parse(req.url).query;
		var args = querystring.parse(query);
		
		proc.exec("iptables -t " + args.t + " -D " + args.c.toUpperCase() + " " + args.i, function(error, stdout, stderr) {
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

		var run = "iptables -t " + args.t + " -L " + args.c.toUpperCase() + " -vn";
		proc.exec(run, function(error, stdout, stderr) {
			var arr = stdout.split("\n");
			
			res.writeHead(200, {"Cache-Control": "no-cache"});
			res.end(JSON.stringify(arr));
		});
	},
	
	chainList: function(req, res) {
		var new_arr = [];
		var n = 0;
		
		proc.exec("iptables -S", function(error, stdout, stderr) {
			var arr = stdout.split("\n");
			
			var n = 0;
			for(var i = 0; i < arr.length; i++) {
				var item = arr[i];
				if(item.indexOf("-N") === 0) {
					new_arr[n++] = item.substring(3) + " (filter)";
				}
			}
			
			proc.exec("iptables -t nat -S", function(error, stdout, stderr) {
				var arr = stdout.split("\n");

				for(var i = 0; i < arr.length; i++) {
					var item = arr[i];
					if(item.indexOf("-N") === 0) {
						new_arr[n++] = item.substring(3) + " (nat)";
					}
				}

				proc.exec("iptables -t mangle -S", function(error, stdout, stderr) {
					var arr = stdout.split("\n");

					for(var i = 0; i < arr.length; i++) {
						var item = arr[i];
						if(item.indexOf("-N") === 0) {
							new_arr[n++] = item.substring(3) + " (mangle)";
						}
					}
					
					res.end(JSON.stringify(new_arr));
				});
			});
		});
	},
    
    save: function(req, res) {
        proc.exec("iptables-save > " + module.exports._settings.savePath, function(error, stdout, stderr) {

			res.end(stderr);
		});
    },
    
    load: function(req, res) {
        proc.exec("iptables-restore < " + module.exports._settings.savePath, function(error, stdout, stderr) {

			res.end(stderr);
		});
    },
	
	settings: function(req, res) {
		var query = url.parse(req.url).query;
		var args = querystring.parse(query);
		
		if(args.c === "save") {
            var body = '';
            req.on('data', function (data) {
                body += data;
            });
            req.on('end', function () {
                var post = querystring.parse(body);
                var data = post['data'];
                
                module.exports._settings = JSON.parse(data);
                module.exports.saveSettings();
            });
			res.end();
		}
		else {
			var themes = [];
			var items = fs.readdirSync("./tpl/theme");
			for (var item of items) {
				themes.push(item.substring(0, item.length-4));
			}
			module.exports._settings.themes = themes;
			res.end(JSON.stringify(module.exports._settings));
		}
	},
	
	authMe: function(req, res) {
		var pathname = url.parse(req.url).pathname;
		
		if(pathname === "/login") {
			var body = '';
			req.on('data', function (data) {
				body += data;
			});
			req.on('end', function () {
				var post = querystring.parse(body);
				var login = post['login'];
				var pass = post['pass'];

				var auth = login === module.exports._settings.user && pass === module.exports._settings.pass;
				if(auth) {
					var ip = req.connection.remoteAddress;
					module.exports.authUsers[ip] = 1;
					res.writeHead(301, {"Location": "/"});
					res.end();
				}
				else {
					res.end("Error!");
				}
			});
		}
		else {
			res.writeHead(301, {"Location": "auth.html", "Cache-Control": "no-cache"});
			res.end();
		}
	},
	
	isAuth: function(req) {
		var ip = req.connection.remoteAddress;
		return module.exports.auth || module.exports.authUsers[ip];
	},
	
	logout: function(req, res) {
		var ip = req.connection.remoteAddress;
		module.exports.authUsers[ip] = 0;
		res.writeHead(301, {"Location": "auth.html", "Cache-Control": "no-cache"});
		res.end();
	},
	
	userList: function(req, res) {
		for(var ip in module.exports.authUsers) {
			res.write("IP: " + ip + " " + (module.exports.authUsers[ip] ? "auth" : "none"));
		}
		res.end();
	}
};

module.exports.loadSettings();