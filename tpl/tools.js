_settings = {};

$(document).ready(function(){
	$.get("/settings", function(data){
		_settings = JSON.parse(data);
	});
});

function showError(text) {
	$(".error").html(text).fadeIn().click(function(){
		$(this).fadeOut();
	});
}