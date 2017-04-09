onmessage = function(e){
	var R = 6371; 
	var lat1 = (e.data.lat1) * Math.PI / 180;
	var lat2 = (e.data.lat2) * Math.PI / 180;
	var dlat = (e.data.lat2-e.data.lat1) * Math.PI / 180;
	var dlng = (e.data.lng2-e.data.lng1) * Math.PI / 180;

	var a = Math.sin(dlat/2) * Math.sin(dlat/2) +
	        Math.cos(lat1) * Math.cos(lat2) *
	        Math.sin(dlng/2) * Math.sin(dlng/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

	var d = R * c;

	self.postMessage({result: d.toFixed(2)});
};