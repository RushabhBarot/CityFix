// Location service configuration
export const LOCATION_CONFIG = {
  // Choose your preferred geocoding service
  service: 'nominatim', // Options: 'nominatim', 'google', 'mapbox'
  
  // Google Places API (requires API key)
  google: {
    apiKey: 'YOUR_GOOGLE_PLACES_API_KEY', // Replace with your actual API key
    searchUrl: 'https://maps.googleapis.com/maps/api/place/autocomplete/json',
    geocodeUrl: 'https://maps.googleapis.com/maps/api/geocode/json'
  },
  
  // Nominatim (OpenStreetMap - free)
  nominatim: {
    searchUrl: 'https://nominatim.openstreetmap.org/search',
    geocodeUrl: 'https://nominatim.openstreetmap.org/reverse'
  },
  
  // Mapbox (requires API key)
  mapbox: {
    apiKey: 'YOUR_MAPBOX_API_KEY', // Replace with your actual API key
    searchUrl: 'https://api.mapbox.com/geocoding/v5/mapbox.places',
    geocodeUrl: 'https://api.mapbox.com/geocoding/v5/mapbox.places'
  }
};

// Helper function to get the current service configuration
export const getLocationService = () => {
  return LOCATION_CONFIG[LOCATION_CONFIG.service];
};

// Helper function to check if a service requires an API key
export const requiresApiKey = (service) => {
  return ['google', 'mapbox'].includes(service);
};

// Helper function to check if the current service is available
export const isServiceAvailable = () => {
  const service = getLocationService();
  if (requiresApiKey(LOCATION_CONFIG.service)) {
    return service.apiKey && service.apiKey !== 'YOUR_API_KEY';
  }
  return true; // Nominatim is always available
}; 