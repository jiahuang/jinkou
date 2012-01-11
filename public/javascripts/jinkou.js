$(document).ready(function(){
  $('#login').click(function(){
    $('#loginDiv').toggle();
  });
  $('#create').click(function(){
    $('#createDiv').toggle();
  });
  $('#addPhotos').change(function(){
    var data = new FormData();
    $.each($('#addPhotos')[0].files, function(i, file) {
      data.append(i, file);
    });
    $.ajax({
      url: '/photos',
      data: data,
      cache: false,
      contentType: false,
      processData: false,
      type: 'POST',
      success: function(data){
          alert("yeeee");
      }
    });
  });
  var latlng = new google.maps.LatLng(42.293, -71.264);
  var myOptions = {
	  zoom: 8,
    center: latlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	var map = new google.maps.Map(document.getElementById("mapCanvas"),myOptions);
  
});

