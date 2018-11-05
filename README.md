iptables WEB gui

![ScreenShot](http://i.mcgl.ru/RGGJv4MAvA)

### Howto install ###

In first time you need to Download and install Node.js

### Howto use ###

* Clone repository:
```bash
git clone https://github.com/puux/iptables.git
```
* Run server:
```bash
cd iptables
# only for first time you, need to download dependancies
npm install
# and then you can start the server
node server.js
```
* Open browser and goto http://127.0.0.1:1337/

### Howto create own theme ###

* cd ./tpl/styles/
* open and change config.scss
* compile: scss --sourcemap=none style.scss ../theme/MyTheme.css
* select theme in Settings->Theme

### Default user and password ###

User: admin
Pass: (empty)

You can change this here https://github.com/puux/iptables/blob/master/handlers.js#L14
