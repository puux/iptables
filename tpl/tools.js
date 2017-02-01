_settings = {};

$(document).ready(function(){
	$.get("/settings", function(data){
		_settings = JSON.parse(data);
        $(".param").each(function(index, obj){
            $(obj).val(_settings[obj.id]);
        });
		
		if(_settings.LANS) {
			for(var lan in _settings.LANS) {
				$("#lans").append(window.tpl.settingsLan(lan, _settings.LANS[lan]));
			}
		}
		else {
			_settings.LANS = {};
		}
		if(_settings.PORTS) {
			for(var port in _settings.PORTS) {
				$("#ports").append(window.tpl.settingsPort(port, _settings.PORTS[port]));
			}
		}
		else {
			_settings.PORTS = {};
		}
		
		if(_settings.pass) {
			$("#logout").show();
		}

		$("#theme").attr("href", "theme/" + _settings.theme + ".css");
		for(var i in _settings.themes) {
			var theme = _settings.themes[i];
			$("#themeSelector").append("<option " + (theme == _settings.theme ? "selected" : "") + ">" + theme + "</option>");
		}
		$("#themeSelector").on("change", function(){
			$("#theme").attr("href",  "theme/" + this.value + ".css");
			_settings.theme = this.value;
		});
	});
});

function showError(text) {
	$(".error").html(text).fadeIn().click(function(){
		$(this).fadeOut();
	});
}

function showInfo(text) {
	$(".info").html(text).fadeIn().click(function(){
		$(this).fadeOut();
	});
}