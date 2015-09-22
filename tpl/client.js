var channel = "";

$(document).ready(function(){
	rules.showList("input");
	
	setInterval(rules.monitor, 1000);
});

var parser = {
	
	parseChannels: function (data) {
		
		this.editRuleRow = null;
		
		var arr = JSON.parse(data);

		$("#main").html('<tr><td class="id">ID</td><td class="mon">pkts</td><td class="mon">bytes</td><td class="rule">RULE</td><td class="cmd">CMD</td></tr>');

		var index = 0;
		for(var line in arr) {
			var val = arr[line];
			if(val) {
				$("#main").append(parser.makeRuleTpl(index, val));
			}
			index++;
		}

		$("#main").append('<tr><td colspan="3"></td><td colspan="1"><form onsubmit="return rules.insert();"><input type="text" id="rule" class="ruleeditor"/></form></td><td></td></tr>');
	},
	
	makeRuleTpl: function (index, text) {
		var ntext = this.makeRuleText(text);

		return "<tr>" +
				'<td class="row" id="lindx">' + index + "</td>" +
				'<td class="rowright" id="pkts' + index + '"></td>' +
				'<td class="rowright" id="bytes' + index + '"></td>' +
				'<td class="row" id="rule' + index + '"><span class="edittext">' + ntext + '<img class="edit" src="/img/edit.png" onclick="parser.editRule(' + index + ')"/></spawn></td>' +
				'<td class="row"><a href="#" onclick="return rules.remove(' + index + ');" title="Delete"><img src="/img/delete.png"/></a>' + "</td>" +
				"</tr>";
	},
	
	FIN_RULES: {DROP:1, ACCEPT:1, LOG:1, TCPMSS:1, RETURN:1, DNAT:1, MASQUERADE:1},
	makeRuleText: function (text) {
		text = text
			.replace(/(-[o|i]) ([a-z0-9]+)/g, function(str, dir, int){
				return dir + ' <b>' + (window._settings.LANS[int] || int) + '</b>';
			})
			.replace(/(\-d|\-s|\-\-to\-destination) ([0-9\.\/]+)/g, '$1 <span class="ipt-net">$2</span>')
			.replace(/(--dport) ([0-9\.\/]+)/g, function(str, param, port){
				return param + ' <span class="ipt-port">' + (window._settings.PORTS[port] || port) + '</span>';
			})
			.replace(/(ACCEPT|DROP)/g, '<span class="ipt-$1">$1</span>')
			.replace(/-j ([A-Z\_]+)/g, function(str, name) {
				var lname = name.toLowerCase();
				if(parser.FIN_RULES[name]) {
					return "-j " + name;
				}
				return '-j <a href="javascript: rules.showList(\'' + lname + '\');">' + name + "</a>";
			});

		return text;
	},
	
	editRuleRow: null,
	editRuleRowText: "",
	editRuleRowIndex: "",
	editRuleAction: function (key) {
		if(key === 27) {
			if(this.editRuleRow) {
				this.editRuleRow.html(this.editRuleRowText);
				this.endEditRule();
			}
		}
		else if(key === 13) {
			this.editRuleRow.html(this.makeRuleText(text = this.editRuleRow.children().val()));
			this.endEditRule();
			text = text.replace("-A " + channel.toUpperCase(), "-R " + channel.toUpperCase() + " " + this.editRuleRowIndex); 
			rules.insertText(text);
		}
	},

	editRule: function (index) {
		var rule = $("#rule" + index);
		if(this.editRuleRow === null || rule.attr("id") !== this.editRuleRow.attr("id")) {
			if(this.editRuleRow) {
				this.editRuleRow.html(this.editRuleRowText);
			}
			var value = rule.text();
			this.editRuleRowText = rule.html();
			rule.html('<input type="text" onkeyup="parser.editRuleAction(event.keyCode);" class="ruleeditor"/>').children().val(value);
			rule.children().focus();

			this.editRuleRow = rule;
			this.editRuleRowIndex = index;
		}
	},
    
    endEditRule: function() {
        this.editRuleRow = null;
    }
	
};

var rules = {
	showList: function (name) {
		channel = name;
		
		$(".itemselect").removeClass("itemselect").addClass("item");
		$(".item").each(function(index, obj) {
			if($(obj).text() === name.toUpperCase()) {
				$(obj).removeClass("item").addClass("itemselect");
			}
		});

        parser.endEditRule();
		$.get("channel?c=" + name, parser.parseChannels);
	},
	
	remove: function (index) {
		$.get("delete?i=" + index + "&c=" + channel, parser.parseChannels);
		return false;
	},
	
	insert: function () {
		this.insertText($("#rule").val());
		
		return false;
    },
    
    insertText: function (text) {
		if(text.search(/-[A|I|R]/g) === -1) {
			text = "-A " + channel.toLocaleUpperCase() + " " + text ;
		}
		if(channel === "prerouting" || channel === "postrouting") {
			text = "-t nat " + text;
		}
        
        for(var lan in window._settings.LANS) {
            text = text.replace(new RegExp(" " + window._settings.LANS[lan] + " ", 'g'), " " + lan + " ");
        }
        for(var port in window._settings.PORTS) {
            text = text.replace(new RegExp(" " + window._settings.PORTS[port] + " ", 'g'), " " + port + " ");
        }
        
		$.post("insert?c=" + channel, {rule: text}, function(data){
			if(data) {
				if(data.substr(0, 1) === "[") {
					parser.parseChannels(data);
				}
				else {
					showError(data);
				}
			}
		});

		return false;
	},
	
	monitor: function() {
		$.get("/mon?c=" + channel, function(data){
			var arr = JSON.parse(data);
			var index = 0;
			for(var i = 0; i < arr.length; i++) {
				var items = arr[i].trim().replace(/[ ]+/g, ' ').split(" ");

				if(i === 0) {
					pkts = 4;
					bytes = 6;
				}
				else {
					pkts = 0;
					bytes = 1;
				}
				
				$("#pkts" + index).html(items[pkts]);
				$("#bytes" + index).html(items[bytes]);
				if(i !== 1) {
					index++;
				}
			}
		});
	}

};

var tools = {
    pageIndex: 1,
    
	save: function() {
		$.get("/save", function(data) {
			if(data) {
				showError(data);
			}
		});
	},
    
    selectPage: function(index) {
        $("#settings-page" + tools.pageIndex).hide();
        tools.pageIndex = index;
        $("#settings-page" + index).show();
    },
    
    addLan: function() {
        $("#lans").append(window.tpl.settingsLan("", ""));
    },
    
    removeLan: function(obj) {
        $(obj).parent().parent().remove();
    },
	
    addPort: function() {
        $("#ports").append(window.tpl.settingsPort("", ""));
    },
    
	settingsDlg: function() {
		$(".settings").dialog({
			title:"Iptables settingss",
			modal:true,
			resizable:false,
			width: 600,
			buttons: [
				{
					text: "Save",
					click: function() {
                        $(".param").each(function(index, obj){
                            window._settings[obj.id] = $(obj).val();
                        });
                        window._settings.LANS = {};
                        $(".lan").each(function(index, obj){
                            window._settings.LANS[$(obj).children()[0].firstChild.value] = $(obj).children()[1].firstChild.value;
                        });
						window._settings.PORTS = {};
                        $(".port").each(function(index, obj){
                            window._settings.PORTS[$(obj).children()[0].firstChild.value] = $(obj).children()[1].firstChild.value;
                        });
                        $.post("/settings?c=save", {data: JSON.stringify(window._settings)}, function(data) {
                            if(data) {
                                showError(data);
                            }
                        });
						$(".settings").dialog("close");
					}
				}
			]
		});
	}
};