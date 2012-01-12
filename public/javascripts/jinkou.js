// appends images to sidebar
  function populateSideBar(imgUrl){
    $('#imgTimeline')
      .append($('<span>')
        .append($('<img>')
          .attr('src', '/images/ajax-loader.gif')
          .attr('class', 'ajaxImg')));
  }
  
$(document).ready(function(){
  $('#login').click(function(){
    $('#loginDiv').toggle();
  });
  $('#create').click(function(){
    $('#createDiv').toggle();
  });
  
  $('#addPhotos').change(function(){
    $.each($('#addPhotos')[0].files, function(i, file) {
      var data = new FormData();
      data.append(i, file);
      // placeholder for img thumbnail
      
      $.ajax({
        url: '/photos',
        data: data,
        cache: false,
        contentType: false,
        processData: false,
        type: 'POST',
        success: function(data){
            console.log(data);
            console.log(data.img_url);
            // replace placeholder
        }
      });
  
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

