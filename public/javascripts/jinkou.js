var GLOBAL;
$(document).ready(function(){
  $('#login').click(function(){
    $('#loginDiv').toggle();
  });
  $('#create').click(function(){
    $('#createDiv').toggle();
  });

  function placeHolderImg(num){
    $('#imgTimeline')
      .append($('<span>')
        .append($('<img>')
          .attr('src', '/images/site/ajax-loader.gif')
          .attr('id', 'sideImg-'+num)
          .attr('class', 'ajaxImg')));
  }
  
  function populateSideBar(num, imgUrl){
    console.log(num);
    console.log(imgUrl);
    var img = $('#imgTimeline').find('#sideImg-'+num);
    console.log(img);
    img.attr('src', imgUrl);
    img.attr('class', 'sideBarImg');
  }
  
  function uploadFileHelper(file,num){
    var data = new FormData();
    data.append(0, file);
    // placeholder for img thumbnail
    placeHolderImg(num);
    
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
        populateSideBar(num, data.img_url);
      }
    });
  }
  
  $('#addPhotos').change(function(){
    var num = 0;
    $.each($('#addPhotos')[0].files, function(i, file) {
      uploadFileHelper(file, num);
      num++;
    });
  });
  var latlng = new google.maps.LatLng(42.293, -71.264);
  var myOptions = {
	  zoom: 8,
    center: latlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	var map = new google.maps.Map(document.getElementById("mapCanvas"),myOptions);
  
  google.maps.event.addListener(map, 'click', function( event ){
    console.log('add marker');
   var marker = new google.maps.Marker({
      position: event.latLng,
      map: map,
      draggable: true
    });
  });
  
  function loadPhotos(){
    console.log('loading photos');
    var username = $('#user').html();
    console.log(username);
    $.ajax({
      url: '/photos/'+username,
      type: 'GET',
      success: function(data){
        GLOBAL = data;
        console.log(data);
        //var num = 0;
        $.each(data.imgs, function(i, img) {
          $('#imgTimeline')
          .append($('<span>')
            .append($('<img>')
              .attr('src', '/images/uploaded/small'+img['image'])
              .attr('class', 'sideBarImg')));
        });
      }
    });
  }
  
  loadPhotos();
});

