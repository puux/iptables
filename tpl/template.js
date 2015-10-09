var tpl = {
    settingsLan: function (interface, name) {
        return '<tr class="lan">\n\
                    <td><input type="text" value="' + interface + '"/></td>\n\
                    <td><input type="text" value="' + name + '"/></td>\n\
                    <td><a href="#" onclick="tools.removeLan(this);"><img src="/img/delete.png"/></a></td>\n\
                </tr>';
    },
	
    settingsPort: function (port, name) {
        return '<tr class="port">\n\
                    <td><input type="text" value="' + port + '"/></td>\n\
                    <td><input type="text" value="' + name + '"/></td>\n\
                    <td><a href="#" onclick="tools.removeLan(this);"><img src="/img/delete.png"/></a></td>\n\
                </tr>';
    },
	
	customChain: function (name, table) {
		return '<li><a onclick="rules.showList(\'' + name + '\', \'' + table + '\');">' + name + " (" + table + ') <img chainname="' + name + '" chaintable="' + table + '"onclick="rules.removeChain(this);" style="float: right;" src="/img/delete.png"/></a></li>';
	},
	
	customChainAddNew: '<li class="newchain"><a onclick="rules.addChain();">Add new ...</a></li>',
	
	actionSub: function(action) {
		if(action === "DNAT") {
			return 'destination <input type="text" id="new_to_destination"/>';
		}
		if(action === "LOG") {
			return 'prefix <input type="text" id="new_log_prefix"/> level <input type="text" id="new_log_level"/>';
		}
		
		return "";
	}
};

