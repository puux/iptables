var channel = "";

$(document).ready(function(){
	selectChannel("input");
	
	setInterval(function(){
		$.get("/mon?c=" + channel, function(data){
			var arr = JSON.parse(data);
			var index = 0;
			for(var i = 0; i < arr.length; i++) {
				var items = arr[i].trim().replace(/[ ]+/g, ' ').split(" ");

				if(i == 0) {
					pkts = 4;
					bytes = 6;
				}
				else {
					pkts = 0;
					bytes = 1;
				}
				
				$("#pkts" + index).html(items[pkts]);
				$("#bytes" + index).html(items[bytes]);
				if(i != 1) {
					index++;
				}
			}
		});
	}, 1000);
});

var LANS = {};

function makeRuleText(text) {
	
	text = text.replace(/(-[o|i]) ([a-z0-9]+)/g, function(str, dir, int){
		return dir + ' <b>' + (LANS[int] || int) + '</b>';
	});
	text = text.replace(/(\-d|\-s|\-\-to\-destination) ([0-9\.\/]+)/g, '$1 <span class="net">$2</span>');
	text = text.replace(/(--dport) ([0-9\.\/]+)/g, '$1 <span class="port">$2</span>');
	
	text = text.replace(/(ACCEPT|DROP)/g, '<span class="$1">$1</span>');
	
	return text;
}

function makeRule(index, text) {
	var ntext = makeRuleText(text);
	
	return "<tr>" +
			'<td class="row" id="lindx">' + index + "</td>" +
			'<td class="rowright" id="pkts' + index + '"></td>' +
			'<td class="rowright" id="bytes' + index + '"></td>' +
			'<td class="row" id="rule' + index + '" onclick="editRule(' + index + ')">' + ntext + "</td>" +
			'<td class="row"><a href="javascript: deleteRule(' + index + ');">del</a>' + "</td>" +
			"</tr>";
}

var editRuleRow = null;
var editRuleRowText = "";
var editRuleRowIndex = "";

function editRule(index) {
	var rule = $("#rule" + index);
	if(editRuleRow == null || rule.attr("id") != editRuleRow.attr("id")) {
		if(editRuleRow) {
			editRuleRow.html(editRuleRowText);
		}
		var value = rule.text();
		editRuleRowText = rule.html();
		rule.html('<input type="text" onkeyup="editRuleAction(event.keyCode);"/>').children().val(value);
		rule.children().focus();
		
		editRuleRow = rule;
		editRuleRowIndex = index;
	}
}

function editRuleAction(key) {
	if(key == 27) {
		if(editRuleRow) {
			editRuleRow.html(editRuleRowText);
			editRuleRow = null;
		}
	}
	else if(key == 13) {
		editRuleRow.html(makeRuleText(text = editRuleRow.children().val()));
		editRuleRow = null;
		text = text.replace("-A " + channel.toUpperCase(), "-R " + channel.toUpperCase() + " " + editRuleRowIndex); 
		$.post("insert?c=" + channel, {rule: text}, function(data){
			if(data) {
				if(data.substr(0, 1) == "[") {
					parseChannels(data);
				}
				else {
					showError(data);
				}
			}
		});
	}
}

function parseChannels(data) {
	var arr = JSON.parse(data);
	
	$(".main").html('<tr><td class="id">ID</td><td class="mon">pkts</td><td class="mon">bytes</td><td class="rule">RULE</td><td class="cmd">CMD</td></tr>');

	var index = 0;
	for(line in arr) {
		var val = arr[line];
		if(val) {
			$(".main").append(makeRule(index, val));
		}
		index++;
	}
	
	$(".main").append('<tr><td colspan="3"></td><td colspan="1"><form onsubmit="return insertRule();"><input type="text" id="rule"/></form></td><td></td></tr>');
}

function selectChannel(name) {
	channel = name;
	editRuleRow = null;
	
	$.get("channel?c=" + name, parseChannels);
}

function deleteRule(index) {
	$.get("delete?i=" + index + "&c=" + channel, parseChannels);
}

function insertRule() {
	var text = $("#rule").val();
	if(channel == "prerouting" || channel == "postrouting") {
		text = "-t nat " + text;
	}
	$.post("insert?c=" + channel, {rule: text}, function(data){
		if(data) {
			if(data.substr(0, 1) == "[") {
				parseChannels(data);
			}
			else {
				showError(data);
			}
		}
	});
	
	return false;
}

function showError(text) {
	$(".error").html(text);
	$(".error").fadeIn();
	$(".error").click(function(){
		$(this).fadeOut();
	});
}