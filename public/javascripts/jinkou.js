$(document).ready(function(){
  $('#login').click(function(){
    $('#loginDiv').toggle();
  });
  $('#create').click(function(){
    $('#createDiv').toggle();
  });
  
  var latlng = new google.maps.LatLng(42.293, -71.264);
  var myOptions = {
	  zoom: 8,
    center: latlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	var map = new google.maps.Map(document.getElementById("mapCanvas"),myOptions);
  
});

