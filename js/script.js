function openNav() {
    document.getElementById("menu").style.width = "250px";
};

function closeNav() {
    document.getElementById("menu").style.width = "0";
};

// Create array of locations
var locations = [
    {title: 'The Association', location: {lat: 51.51364, lng: -0.0813276}, venueFoursquareID: '4f70a772e4b0f375fc669005'},
    {title: 'The Attendant', location: {lat: 51.5190854, lng: -0.141135}, venueFoursquareID: '51238309e4b097759c47afa3'},
    {title: 'Catalyst', location: {lat: 51.5197791, lng: -0.112479}, venueFoursquareID: '58510b240b7e9333972d5d3b'},
    {title: 'Coffee Island', location: {lat: 51.5123922, lng: -0.1280521}, venueFoursquareID: '5831681f01f4330b38c28821'},
    {title: 'Curators Coffee Studio', location: {lat: 51.5120838, lng: -0.084918}, venueFoursquareID: '4f5b23f9e4b082b23ccdd12a'},
    {title: 'Department of Coffee & Social Affairs', location: {lat: 51.5194387, lng: -0.1091213}, venueFoursquareID: '4cfa6667ee9cb60c44fd89ad'},
    {title: 'The Espresso Room', location: {lat: 51.5218715, lng: -0.1200087}, venueFoursquareID: '4ace06a9f964a520f5cd20e3'},
    {title: 'The New Black', location: {lat: 51.5110634, lng: -0.0864777}, venueFoursquareID: '582216af31e59d538d03e68c'},
    {title: 'Look Mum No Hands!', location: {lat: 51.5241713, lng: -0.0990777}, venueFoursquareID: '4bd0432a9854d13a6855f74d'},
    {title: 'Notes Music & Coffee', location: {lat: 51.5204827, lng: -0.1172634}, venueFoursquareID: '4cdadd2dc409b60cac66d11a'}
  ];
// Create a blank array for all the listing markers.
var markers = [];
// Create the map
var map;
function mapError() {
  alert("We are currently unable to load the map, try again later!");
}
function initMap() {
  map = new google.maps.Map(document.getElementById('map'),{
    center: {lat: 51.5142381, lng: -0.0691172},
    zoom: 16
  });
  var bounds = new google.maps.LatLngBounds();
  // Loop through location array to create markers
  for (var i = 0; i < locations.length; i++) {
    var position = locations[i].location;
    var title = locations[i].title;
    var id = locations[i].venueFoursquareID;
    var image = 'coffee.png';
    var marker = new google.maps.Marker({
      map: map,
      position: position,
      title: title,
      id: id,
      icon: image,
      animation: google.maps.Animation.DROP
    });
    markers.push(marker);
    // Create event to open an infowindow at each marker.
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });
    // Bind marker to view model observable array
    viewModel.locations()[i].marker = marker;

    bounds.extend(markers[i].position);

  }
  var largeInfowindow = new google.maps.InfoWindow();

  // Extend the boundaries of the map for each marker
  map.fitBounds(bounds);
};

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
  // Make the marker icon bounce when it's clicked
  function toggleBounce() {
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      //Stops after two bounce
      setTimeout(function(){
				marker.setAnimation(null);
			}, 1400);
    }
  };
  toggleBounce();
  if (infowindow.marker != marker) {
    var apiURL = 'https://api.foursquare.com/v2/venues/';
    var foursquareClientID = 'SW3IZKUPHHSZQM2DVO5TVJ3TX1RIRENN3JUPETZWJKRK3EAW'
    var foursquareSecret ='Q4OH5U1JPO1GHP0DLEPVMOZ3BPVYU0SRPFQQE2QWRX1YKUMQ';
    var foursquareVersion = '20170805';
    var foursquareURL = apiURL + marker.id + '?client_id=' + foursquareClientID +  '&client_secret=' + foursquareSecret +'&v=' + foursquareVersion;

    $.ajax({
      url: foursquareURL,
      async: true,
      success: function(data) {
        // Check if a description is available, if not then display the last tip instead of the description
        if(data.response.venue.description){
          marker.description = data.response.venue.description;
        } else {
          marker.description = data.response.venue.tips.groups["0"].items["0"].text;
        };
        marker.rating = data.response.venue.rating;
        marker.address = data.response.venue.location.address + ', ' + data.response.venue.location.city;
        console.log(data);
        infowindow.setContent('<div class="iw-title">' + marker.title + '<span class="iw-rating"> ' + marker.rating + '</span>' + '</div>' + '<div class="iw-description">' + marker.description + '</div>'+ '<div class="iw-address">' + marker.address + '</div>');
        infowindow.open(map, marker);
        marker.animation = google.maps.Animation.DROP;
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick',function(){
          infowindow.setMarker = null;
        });
        // Check to make sure the infowindow is not already opened on this marker.
        infowindow.marker = marker;
      },
      error: function(data) {
        // Error handler when request to Foursquare fails
        alert("Data from Foursquare cannot be loaded");
      }
    });
  }
};

var ViewModel = function() {
  var self = this;
  self.locations = ko.observableArray(locations);
  self.visibleLocations = ko.observableArray([]);
  self.searchItem = ko.observable("");
  self.visibleLocations = ko.computed(function () {
    // Filtering the locations (list items and map markers)
    return ko.utils.arrayFilter(self.locations(), function (location) {
      // Filtering the map markers
      if (location.title.toLowerCase().indexOf(self.searchItem().toLowerCase()) !== -1) {
        if (location.marker)
          location.marker.setVisible(true);
      } else {
        if (location.marker)
          location.marker.setVisible(false);
      }
      // Filtering the list items
      return location.title.toLowerCase().indexOf(self.searchItem().toLowerCase()) !== -1;
    });
  }, self);

  //Display the infowindow when an element of the list is clicked
  self.clickItem = function (location) {
    google.maps.event.trigger(location.marker, 'click');
    if ($(window).width() < 960) {
      closeNav();
    }
  };

  //Display all locations on the map and in the list
  this.resetListings = function() {
    self.searchItem("");
  }
};

// Instantiate the ViewModel
var viewModel = new ViewModel();

// Apply the binding
ko.applyBindings(viewModel);
