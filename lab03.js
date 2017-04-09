var currentLoc = new latLng();
var coordsFromFile = [];
var count = 0, c = 0;
var map, currentWindow, infowindow;
var markers = [];

function displayLatLng(lat, lng){	
	var geocoder = new google.maps.Geocoder;
	var latlng = {lat: parseFloat(currentLoc.lat), lng: parseFloat(currentLoc.lng)};
	geocoder.geocode({'location': latlng}, function(results, status) {
		if (status === 'OK') {
			var address = results[0].formatted_address;
			document.getElementById("demo").innerHTML = "Your Location: " + address; 
		}
	});
}

function initMap(){
	map = new google.maps.Map(document.getElementById('map'),{
		center: {
			lat: 43.6532,
			lng: -79.3832
		},
		zoom: 8
	});
	searchLocation();
}

function currentLocation(){
	if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(successCall, errorCall);
    } 
    else { 
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function successCall (position) {
	currentLoc.lat = position.coords.latitude;
	currentLoc.lng = position.coords.longitude;

	var mapProp = {center:new google.maps.LatLng(currentLoc.lat,currentLoc.lng), zoom:14};
	map = new google.maps.Map(document.getElementById("map"),mapProp);

	displayLatLng();

	currentWindow =  new google.maps.InfoWindow;
	var geocoder = new google.maps.Geocoder;
	geocodeLatLng(geocoder, map, currentWindow, currentLoc.lat, currentLoc.lng) ;
}

function errorCall(error){
	switch(error.code){
		case 0 : 
		document.getElementById("demo").innerHTML = error.message;
		break;
		case 1 : 
		document.getElementById("demo").innerHTML = error.message;
		break;
		case 2 :
		document.getElementById("demo").innerHTML = error.message;
		break;
	}
}

function searchLocation(){
 	autocomplete = new google.maps.places.Autocomplete(
 		(document.getElementById('autocomplete')), {
 			types: ['geocode']
 		});

 	autocomplete.addListener('place_changed', function (){
	 	var place = autocomplete.getPlace();
	 	try{
			var mapProp = {center:new google.maps.LatLng(place.geometry.location.lat(),place.geometry.location.lng()), zoom:14};

			currentLoc.lat = place.geometry.location.lat();
			currentLoc.lng = place.geometry.location.lng();

			map = new google.maps.Map(document.getElementById("map"),mapProp);

			displayLatLng();

			currentWindow =  new google.maps.InfoWindow;
			var geocoder = new google.maps.Geocoder;
			geocodeLatLng(geocoder, map, currentWindow, currentLoc.lat, currentLoc.lng) ;
		}
		catch(e){
			document.getElementById("demo").innerHTML = "Location Not Found <br>" + e.message;
		}
	});
}

function latLng (lat, lng){
	this.lat = lat || 0; // 0 for default
	this.lng = lng || 0;
}

function getFiles(files){
	var data = [];
	for(var i = 0 ; i < files.length ; i ++){
		data.push(files[i]);

		var r = new FileReader();
		r.readAsText(files[i]);

		r.addEventListener("load", function () {
			var latlngpair = [];
			var coords = this.result.split('\n');
			for(var i = 0; i < coords.length; i++){
				latlngpair.push(coords[i]);
			}
			toCoordinates(latlngpair);
		}, false);
	}
}

function toCoordinates(latlngs){
	
	var fileInfo = document.getElementById("info");
	var geocoder = new google.maps.Geocoder;
	for(var i=0; i<latlngs.length; i++){
		var temp = latlngs[i].split(',');
		var coord = new latLng(temp[0],temp[1]);
		coordsFromFile.push(coord);
		
		var latlng = {lat: parseFloat(temp[0]), lng: parseFloat(temp[1])};
		geocoder.geocode({'location': latlng}, function(results, status) {
			if (status === 'OK') {
				count++;
				var address = results[0].formatted_address;
				fileInfo.innerHTML += "Location " + count + ": " + address +"<br>";
			}
		});
		infowindow = new google.maps.InfoWindow;	
		geocodeLatLng(geocoder, map, infowindow, temp[0], temp[1]);	
	}
	return coordsFromFile;
}

var dropzone = document.getElementById("dropzone");

dropzone.ondrop = function(e){
	e.preventDefault();
	this.className = 'dropzone';
	getFiles(e.dataTransfer.files);
};

dropzone.ondragover = function(){
	this.className = "dropzone dragover";
	return false;
};

dropzone.ondragleave = function(){
	this.className = "dropzone";
	return false;
};	

dropzone.ondragend = function(){
	this.className = "dropzone";
	return false;
};

document.getElementById("distance").addEventListener("click", function(){
	calcDistance(coordsFromFile, currentLoc)
});

function calcDistance(data, current){
	var ww = new Worker ("lab03webWorker.js");
	var size = data.length;

	ww.addEventListener("message", success);
	ww.addEventListener("error", error);

	var locationData = { lat1: 0, lat2: 0, lng1: 0, lng2: 0};

	for (var i = 0; i < size; i++){
		locationData.lat1 = currentLoc.lat;
		locationData.lat2 = data[i].lat;
		locationData.lng1 = currentLoc.lng;
		locationData.lng2 = data[i].lng;
		ww.postMessage(locationData);
	}

	function success(e){
		c++;
		document.getElementById("km").innerHTML += "From current location to location " + c + ": " + e.data.result + "km <br> <br>";
	}				

	function error(){
		document.getElementById("km").innerHTML += "Error";
	}
}

function clearData(){
	c = 0;
	count = 0;
	coordsFromFile = [];
	currentLoc = new latLng(0,0);
	for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
     }
	 markers = [];
	 
	document.getElementById("demo").innerHTML = " ";
	document.getElementById("info").innerHTML = " ";
	document.getElementById("km").innerHTML = " ";
}

function geocodeLatLng(geocoder, map, infowindow, lattitude, longitude) {
	var latlng = {lat: parseFloat(lattitude), lng: parseFloat(longitude)};
	geocoder.geocode({'location': latlng}, function(results, status) {
		if (status === 'OK') {
		  if (results[1]) {
			map.setZoom(11);
			marker = new google.maps.Marker({
			  position: latlng,
			  map: map,
			  });
			markers.push(marker);
			infowindow.setContent(results[0].formatted_address);
			infowindow.open(map, marker);
		  } 
		  else {
			window.alert('No results found');
		  }
		} 
		else {
		  window.alert('Geocoder failed due to: ' + status);
		}
	});
}