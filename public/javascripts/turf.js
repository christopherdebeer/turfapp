alert("OI! no peeking!!");
var turf = {
	map: {},
	tags: [],
	hullPoints: [],
	locations: {
		edinburgh: new google.maps.LatLng (55.950175, -3.187535),
		test: new google.maps.LatLng (-34.397, 150.644),
		user: {},
	},
	initMap: function (latlon) {

	    var myOptions = {
	      zoom: 15,
	      center: latlon,
	      mapTypeId: google.maps.MapTypeId.ROADMAP,
	      panControl: false,
	      streetViewControl: false,
	      mapTypeControl: false,
	      zoomControlOptions: {
	      	position: google.maps.ControlPosition.RIGHT_CENTER
	      }

	    };
	    turf.map = new google.maps.Map(document.getElementById("map"), myOptions);
	},
	userLocation: function (position) {
		turf.locations.user = new google.maps.LatLng (position.coords.latitude, position.coords.longitude);
		turf.map.panTo(turf.locations.user);
	},
	geolocationError: function (err) {
		if (window.console) {console.log(err);}
	  	if (err.code == 1) {
	  		if (window.console) { console.log("User declined to share location, loading default."); }
	  		turf.map.panTo(turf.locations.test);
	  	} else {
	  		// retry

	  	}
	},
	getPositionFromLatLon: function (lat, lon) {
		return {coords:{latitude:lat,longitude:lon}};
	},
	getLatLonFromPosition: function (position) {
		return [position.coords.latitude, position.coords.longitude];
	},
	createCircle: function (latlon,rad) {
		var circleOptions = {
			strokeColor: "#FF0000",
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: "#FF0000",
			fillOpacity: 0.35,
			map: turf.map,
			center: latlon,
			radius: rad
		}
		var myCircle = new google.maps.Circle(circleOptions);
			turf.tags.push(latlon);
			console.log("this is:", google.maps.geometry.spherical.computeDistanceBetween(latlon, turf.locations.edinburgh), " meters from Edinburgh.");  	
		
		
	},
	polyCalc: function (tags) {
		for (var point in tags) {
			for (var point2 in tags) {
				
			} 
		}
	},
	getConvexHullPoints: function (points) {
		console.log("Try make convex hull of all points (",turf.tags.length,") in turf.tags: ", turf.tags);
		
		var hullPoints = [];
		var hullPoints_size;

		points.sort(convex_hull.sortPointY);
		points.sort(convex_hull.sortPointX);
		hullPoints_size = convex_hull.chainHull_2D(points, points.length, turf.hullPoints);

		return turf.hullPoints;
	},
	createPolygon: function (points) {

		console.log("Create a polygon of (",points.length,") points: ", points);
		var newPoly = new google.maps.Polygon({
		    paths: points,
		    strokeColor: "#FF0000",
		    strokeOpacity: 0.8,
		    strokeWeight: 2,
		    fillColor: "#FF0000",
		    fillOpacity: 0.35,
		    map: turf.map
		});

  		
	}
}




$(document).ready( function () {

	turf.initMap(turf.locations.test);
	turf.createCircle(turf.locations.edinburgh, 100);
	$(turf.points).each( function (i,e) {
		console.log(i,e);
		var tmp = new google.maps.LatLng (e.loc[0], e.loc[1]);
		turf.createCircle(tmp,100);
		turf.tags.push(tmp);
	});

	google.maps.event.addListener(turf.map, 'click', function(event) {
		
		// ?Na=" + event.latLng.P.Na.toString() + "&Oa=" + event.latLng.P.Oa.toString()
		var tag = {
			username: "Testuser",
			loc : [event.latLng.lat(), event.latLng.lng()],
			secret: "secretString"
		}
		
    	$.ajax({
		  url: "http://turf.no.de/tag",
		  data: tag,
		  type: "POST",
		  success: function () {

			turf.createCircle(event.latLng,100)
    		if (window.console) { console.log("tag created at location:", event.latLng); }
    		turf.tags.push(event.latLng);
    		// var newHull = turf.getConvexHullPoints(turf.tags);
    		// turf.createPolygon(newHull);
		  }
		});

  	});

	if ($('html').hasClass("geolocation")) {
		if (window.console) { console.log("Client supports geolocation."); }
		navigator.geolocation.getCurrentPosition(turf.userLocation, turf.geolocationError);
	}

	// create a circle test
	


});