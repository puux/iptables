var channel = "";

$(document).ready(function(){
	rules.showList("input");
	
	setInterval(rules.monitor, 1000);
});

var parser = {
	
	parseChannels: function (data) {
		
		this.editRuleRow = null;
		
		var arr = JSON.parse(data);

		$(".main").html('<tr><td class="id">ID</td><td class="mon">pkts</td><td class="mon">bytes</td><td class="rule">RULE</td><td class="cmd">CMD</td></tr>');

		var index = 0;
		for(var line in arr) {
			var val = arr[line];
			if(val) {
				$(".main").append(parser.makeRuleTpl(index, val));
			}
			index++;
		}

		$(".main").append('<tr><td colspan="3"></td><td colspan="1"><form onsubmit="return rules.insert();"><input type="text" id="rule"/></form></td><td></td></tr>');
	},
	
	makeRuleTpl: function (index, text) {
		var ntext = this.makeRuleText(text);

		return "<tr>" +
				'<td class="row" id="lindx">' + index + "</td>" +
				'<td class="rowright" id="pkts' + index + '"></td>' +
				'<td class="rowright" id="bytes' + index + '"></td>' +
				'<td class="row" id="rule' + index + '" onclick="parser.editRule(' + index + ')">' + ntext + "</td>" +
				'<td class="row"><a href="#" onclick="return rules.remove(' + index + ');">del</a>' + "</td>" +
				"</tr>";
	},
	
	LANS: {},
	FIN_RULES: new Set(["drop", "accept", "log", "tcpmss", "return", "dnat", "masquerade"]),
	makeRuleText: function (text) {
		text = text
			.replace(/(-[o|i]) ([a-z0-9]+)/g, function(str, dir, int){
				return dir + ' <b>' + (parser.LANS[int] || int) + '</b>';
			})
			.replace(/(\-d|\-s|\-\-to\-destination) ([0-9\.\/]+)/g, '$1 <span class="net">$2</span>')
			.replace(/(--dport) ([0-9\.\/]+)/g, '$1 <span class="port">$2</span>')
			.replace(/(ACCEPT|DROP)/g, '<span class="$1">$1</span>')
			.replace(/-j ([A-Z\_]+)/g, function(str, name) {
				var lname = name.toLowerCase();
				if(parser.FIN_RULES.has(lname)) {
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
				this.editRuleRow = null;
			}
		}
		else if(key === 13) {
			this.editRuleRow.html(this.makeRuleText(text = this.editRuleRow.children().val()));
			this.editRuleRow = null;
			text = text.replace("-A " + channel.toUpperCase(), "-R " + channel.toUpperCase() + " " + this.editRuleRowIndex); 
			if(channel === "prerouting" || channel === "postrouting") {
				text = "-t nat " + text;
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
			rule.html('<input type="text" onkeyup="parser.editRuleAction(event.keyCode);"/>').children().val(value);
			rule.children().focus();

			this.editRuleRow = rule;
			this.editRuleRowIndex = index;
		}
	}
	
};

var rules = {
	showList: function (name) {
		channel = name;

		$.get("channel?c=" + name, parser.parseChannels);
	},
	
	remove: function (index) {
		$.get("delete?i=" + index + "&c=" + channel, parser.parseChannels);
		return false;
	},
	
	insert: function () {
		var text = $("#rule").val();
		if(text.indexOf("-A") === -1 && text.indexOf("-I") === -1) {
			text = "-A " + channel.toLocaleUpperCase() + " " + text ;
		}
		if(channel === "prerouting" || channel === "postrouting") {
			text = "-t nat " + text;
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

function showError(text) {
	$(".error").html(text).fadeIn().click(function(){
		$(this).fadeOut();
	});
}