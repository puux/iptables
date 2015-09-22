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
	});
});

function showError(text) {
	$(".error").html(text).fadeIn().click(function(){
		$(this).fadeOut();
	});
}