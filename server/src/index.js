const express = require("express");
const WebSocket = require('ws');
const fs = require('fs');
const proc = require('child_process');

//const wss = new WebSocket.Server({port: 20202});
const app = express();

const configFile = "/etc/iptables/config.json"

/**
 * Load app settings
 */
var settings = {
    data: {
        // default options
        savePath: "/etc/iptables/rules.save",
        iptables: "iptables-legacy",
		user: "admin",
		pass: "",
		theme: "Silver",
        themes: ["Silver"],
        ports: [],
        net: []
    },

    load() {
        if(fs.existsSync(configFile)) {
            let data = JSON.parse(fs.readFileSync(configFile))
            for(let key in data)
                settings.data[key] = data[key]
        }
    },
    save() {
        fs.writeFileSync(configFile, JSON.stringify(settings.data))
    },
    set(field, value) {
        settings.data[field] = value
        settings.save()
    },
    get: (field) => settings.data[field]
};
settings.load()

// wss.on('connection', (ws, req) => {
//     sendCommand = (command, data) => ws.send(JSON.stringify({command, data}))
//     ws.on('message', (msg) => {
//         let data = JSON.parse(msg);
//         console.log(data)
//         switch(data.command) {
//             case 'connections':
//                 settings.set(data.command, data.data)
//                 break
//         }
//     })
//     console.log("Connect ws: ", req.connection.remoteAddress)
// })

// wss.on('listening', () => {
//     console.log('WSS started...');
// });

/**
 * Start WEB server
 */

app.use(express.static('public'));

app.use(express.json());
app.use(function (request, response, next) {
    response.setHeader('Access-Control-Allow-Methods', 'POST');
    response.setHeader('Access-Control-Allow-Headers', 'content-type');
    response.setHeader('Access-Control-Allow-Origin', request.headers['origin'] || 'http://localhost:8081/');
    response.setHeader('Access-Control-Allow-Credentials', true);
    if ('OPTIONS' === request.method) {
        response.sendStatus(200);
    }
    else {
        next();
    }
});

function send(response, object) {
    response.setHeader('Content-Type', 'application/json;charset=UTF-8');
    response.send(JSON.stringify(object));
}

app.post("/settings", (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', request.headers['origin']);
    response.setHeader('Access-Control-Allow-Credentials', true);

    // save options
    if(request.body.options) {
        settings.data = request.body.options
        settings.save()
    }
    // load options
    else {
        let customChannels = []
        try {
            let tables = ['filter', 'nat', 'mangle']
            for(let table of tables) {
                let out = proc.execSync(settings.data.iptables + " -t " + table + " -S", {encoding: 'utf-8'});
                let lines = out.split("\n")
                for(let line of lines)
                    if(line.indexOf("-N") === 0)
                        customChannels.push({table, chain: line.substring(3)})
            }

            send(response, {error: '', data: { options: settings.data, customChannels }})
        }
        catch (error) {
            send(response, {error: error.message, data: {}})
        }
    }
});

app.post("/query", (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', request.headers['origin']);
    response.setHeader('Access-Control-Allow-Credentials', true);

    console.log("Query[" + request.body.command + "]")
    try {
        let list = Array.isArray(request.body.command) ? request.body.command : [request.body.command]
        let result = []
        for(let cmd of list) {
            let stdout = proc.execSync(settings.data.iptables + " " + cmd, {encoding: 'utf-8'})
            let lines = stdout.split("\n");
            result = result.concat(lines)
        }
        send(response, {error: '', data: result})
    }
    catch(error) {
        send(response, {error: error.message, data: {}})
    }
});

app.post("/save", (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', request.headers['origin']);
    response.setHeader('Access-Control-Allow-Credentials', true);

    proc.exec(settings.data.iptables + "-save > " + settings.data.savePath, function(error, stdout, stderr) {
        send(response, {error: stderr})
    });
});

app.post("/load", (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', request.headers['origin']);
    response.setHeader('Access-Control-Allow-Credentials', true);

    proc.exec(settings.data.iptables + "-restore < " + settings.data.savePath, function(error, stdout, stderr) {
        if(stderr)
            console.log("Error: ", stderr)
        send(response, {error: stderr})
    });
});

console.log("Listen port:", 1337)
app.listen(1337);