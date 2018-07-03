var tpl = {
    // settings
    settingsLan: function (interface, name) {
        return '<tr class="lan">\n\
                    <td><input type="text" value="' + interface + '"/></td>\n\
                    <td><input type="text" value="' + name + '"/></td>\n\
                    <td class="rowcenter"><a href="#" onclick="tools.removeLan(this);"><img src="/img/delete.png"/></a></td>\n\
                </tr>';
    },
	
    settingsPort: function (port, name) {
        return '<tr class="port">\n\
                    <td><input type="text" value="' + port + '"/></td>\n\
                    <td><input type="text" value="' + name + '"/></td>\n\
                    <td class="rowcenter"><a href="#" onclick="tools.removeLan(this);"><img src="/img/delete.png"/></a></td>\n\
                </tr>';
    },
    
    // custom chains menu
	customChain: function (name, table) {
		return '<li><a onclick="rules.showListWithPath(\'' + name + '\', \'' + table + '\');">' + name + " (" + table + ') <img chainname="' + name + '" chaintable="' + table + '"onclick="rules.removeChain(this);" style="float: right;" src="/img/delete.png"/></a></li>';
	},
	
    customChainAddNew: '<li class="newchain"><a onclick="rules.addChain();">Add new ...</a></li>',
    
    // rules
    ruleRow: function (index, text) {
        return "<tr>" +
            '<td class="rowcenter" id="lindx">' + index + "</td>" +
            '<td class="rowright" id="pkts' + index + '"></td>' +
            '<td class="rowright" id="bytes' + index + '"></td>' +
            '<td class="row" id="rule' + index + '"><span class="edittext">' + text + '<img class="edit" src="/img/edit.png" onclick="parser.editRule(' + index + ')"/></spawn></td>' +
            (index ? '<td class="rowcenter"><a href="#" onclick="return rules.remove(' + index + ');" title="Delete"><img src="/img/delete.png"/></a>' + "</td>" : '<td class="row"></td>') +
            "</tr>";
    },
};

