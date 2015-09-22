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
    }
};

