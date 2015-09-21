var page = 1;

$(document).ready(function(){
	settings.selectPage(1);
});

var settings = {
	selectPage: function(index) {
		$(".itemselect").removeClass("itemselect").addClass("item");
		$("page" + index).removeClass("item").addClass("itemselect");
		
		page = index;
		
		if(page === 1) {
			$(".main").html('<tr><td class="cmd">Param</td><td class="rule">Value</td></tr>');
			$(".main").append(
					'<tr><td class="row">Save rule path</td><td class="row">' + _settings.savePath + "</td></tr>"
				);
		}
		else if(page === 2) {
			$(".main").html('<tr><td class="cmd">Interface</td><td class="rule">Alias</td></tr>');
			for(var lan in _settings.LANS) {
				$(".main").append(
						'<tr><td class="row">' + lan + '</td><td class="row">' + _settings.LANS[lan] + "</td></tr>"
					);
			}
			$(".main").append('<tr><td><input type="text" id="interface"/></td><td><input type="text" id="alias"/></td></tr>');
		}
	},
	
	save: function() {
		$.post("/settings?c=save", {data: _settings}, function(data) {
			if(data) {
				showError(data);
			}
		});
	},
	
	addLan: function() {
		alert('ok');
		return false;
	}
};