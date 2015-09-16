var channel = "";

$(document).ready(function(){
	selectChannel("input");
	
	setInterval(function(){
		$.get("/mon?c=" + channel, function(data){
			var arr = JSON.parse(data);
			var index = 0;
			for(var i = 0; i < arr.length; i++) {
				var items = arr[i].replace(/[ ]+/g,' ').split(" ");

				if(i == 0) {
					text = items[4] + "/" + items[6];
				}
				else {
					text = items[1] + "/" + items[2];
				}
				
				$("#mon" + index).html(text);
				if(i != 1) {
					index++;
				}
			}
		});
	}, 1000);
});

var FIN_RULES = new Set(["drop", "accept", "log", "tcpmss", "return", "dnat", "masquerade"]);

function makeRuleText(text) {
	var arr = text.split(" ");
	
	var ruleIndex = -1;
	for(var i = 0; i < arr.length && ruleIndex == -1; i++) {
		if(arr[i] == "-j") {
			ruleIndex = i;
		}
	}
	
	if(ruleIndex != -1) {
		ruleIndex++;
		var rule = arr[ruleIndex].toLowerCase();
		
		if(FIN_RULES.has(rule)) {
			arr[ruleIndex] = '<span class="' + rule + '">' + arr[ruleIndex] + "</span>";
		}
		else {
			arr[ruleIndex] = '<a href="javascript: selectChannel(\'' + rule + '\');">' + arr[ruleIndex] + "</a>";
		}
	}
	
	return arr.join(" ");
}

function makeRule(index, text) {
	var ntext = makeRuleText(text);
	
	return "<tr>" +
			'<td class="row" id="lindx">' + index + "</td>" +
			'<td class="row" id="mon' + index + '"></td>' +
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
	
	$(".main").html('<tr><td class="id">ID</td><td class="mon">MONITOR</td><td class="rule">RULE</td><td class="cmd">CMD</td></tr>');

	var index = 0;
	for(line in arr) {
		var val = arr[line];
		if(val) {
			$(".main").append(makeRule(index, val));
		}
		index++;
	}
	
	$(".main").append('<tr><td></td><td></td><td><form onsubmit="return insertRule();"><input type="text" id="rule"/></form></td><td></td></tr>');
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