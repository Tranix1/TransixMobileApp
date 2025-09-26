export const darkMapStyle = [
  // ✅ Base background
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#121212" }] // Darker, pure black for true contrast
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#E0E0E0" }] // Bright white for maximum readability
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#121212" }] // Matches background for a clean look
  },

  // ✅ Man-made / built-up (residential feel)
  {
    "featureType": "landscape.man_made",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#282828" }] // Dark gray for a distinct "house" feel
  },

  // ✅ Natural landscape (ground)
  {
    "featureType": "landscape.natural",
    "elementType": "geometry",
    "stylers": [{ "color": "#1A1A1A" }] // A slightly different dark tone to make the ground visible
  },

  // ✅ Parks / green areas
  {
    "featureType": "poi.park",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#004d00" }] // A deep green to stand out clearly
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#90EE90" }] // Lighter green for text
  },

  // ✅ Roads (general)
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#404040" }] // Medium gray for clear roads
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#121212" }] // Matches background
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#B0B0B0" }] // Lighter gray for readability
  },

  // ✅ Highways
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#757575" }] // Even lighter gray for major roads
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#121212" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#FFFFF0" }] // Off-white for high contrast
  },

  // ✅ Local roads (to highlight residential neighborhoods)
  {
    "featureType": "road.local",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#303030" }] // A slightly darker road than general roads
  },

  // ✅ Points of Interest (including car washes)
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#FFA500" }] // Bright orange for visibility
  },
  {
    "featureType": "poi.business",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#424242" }] // Darker gray to stand out from other buildings
  },
  {
    "featureType": "poi.business",
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "on" }] // Explicitly turn on icons for places like car washes
  },

  // ✅ Transit
  {
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [{ "color": "#404040" }] // Matches roads for consistency
  },
  {
    "featureType": "transit.station",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#FFC0CB" }] // A light pink to stand out
  },

  // ✅ Water
  {
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#00008B" }] // Deep blue to be clearly water
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#ADD8E6" }] // Light blue for text
  },
  {
    "featureType": "water",
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#00008B" }] // Matches water background
  }
];
