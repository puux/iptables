_settings = {};

$(document).ready(function(){
	$.get("/settings", function(data){
		_settings = JSON.parse(data);
        $(".param").each(function(index, obj){
            $(obj).val(_settings[obj.id]);
        });
        for(var lan in _settings.LANS) {
            $("#lans").append(window.tpl.settingsLan(lan, _settings.LANS[lan]));
        }
	});
});

function showError(text) {
	$(".error").html(text).fadeIn().click(function(){
		$(this).fadeOut();
	});
}