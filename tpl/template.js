var tpl = {
    settingsLan: function (interface, name) {
        return '<tr class="lan">\n\
                    <td><input type="text" value="' + interface + '"/></td>\n\
                    <td><input type="text" value="' + name + '"/></td>\n\
                    <td><a href="#" onclick="tools.removeLan(this);"><img src="/img/delete.png"/></a></td>\n\
                </tr>';
    }
};

