// Create array of locations
var locations = [
    {title: 'The Association', location: {lat: 51.51364, lng: -0.0813276}},
    {title: 'Attendant', location: {lat: 51.5190854, lng: -0.141135}},
    {title: 'Catalyst', location: {lat: 51.5197791, lng: -0.112479}},
    {title: 'Coffee Island', location: {lat: 51.5123922, lng: -0.1280521}},
    {title: 'Curators Coffee Studio', location: {lat: 51.5120838, lng: -0.084918}},
    {title: 'Department of Coffee & Social Affairs', location: {lat: 51.5194387, lng: -0.1091213}},
    {title: 'Espresso Room', location: {lat: 51.5218715, lng: -0.1200087}},
    {title: 'The New Black', location: {lat: 51.5110634, lng: -0.0864777}},
    {title: 'Look Mum No Hands!', location: {lat: 51.5241713, lng: -0.0990777}},
    {title: 'Notes', location: {lat: 51.5204827, lng: -0.1172634}}
  ];
// Create a blank array for all the listing markers.
var markers = [];
// Create the map
var map;
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
    var marker = new google.maps.Marker({
      map: map,
      position: position,
      title: title,
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
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent('<div>' + marker.title + '</div>');
    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick',function(){
      infowindow.setMarker = null;
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
