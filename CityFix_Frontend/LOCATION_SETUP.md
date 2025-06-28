# Location Functionality Setup Guide

This guide explains how to set up and use the enhanced location functionality in the CityFix application.

## Features

The new location input component provides:

1. **Live Location Detection**: Get your current location using GPS
2. **Location Search with Suggestions**: Search for locations with real-time suggestions
3. **Multiple Geocoding Services**: Support for Google Places, Mapbox, and Nominatim
4. **Fallback Support**: Works even when external services are unavailable

## Setup Instructions

### Option 1: Using Nominatim (Free - Recommended for Testing)

Nominatim is a free geocoding service based on OpenStreetMap data. No API key required.

1. Open `src/config/locationConfig.js`
2. Ensure the service is set to `'nominatim'`:
   ```javascript
   service: 'nominatim'
   ```
3. The application will work immediately without any additional setup.

### Option 2: Using Google Places API (Requires API Key)

For better accuracy and more detailed location data:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. Open `src/config/locationConfig.js`
6. Change the service to `'google'`:
   ```javascript
   service: 'google'
   ```
7. Replace `'YOUR_GOOGLE_PLACES_API_KEY'` with your actual API key:
   ```javascript
   google: {
     apiKey: 'your_actual_api_key_here',
     // ... rest of config
   }
   ```

### Option 3: Using Mapbox (Requires API Key)

For high-quality geocoding with good coverage:

1. Go to [Mapbox](https://www.mapbox.com/) and create an account
2. Get your access token from the account dashboard
3. Open `src/config/locationConfig.js`
4. Change the service to `'mapbox'`:
   ```javascript
   service: 'mapbox'
   ```
5. Replace `'YOUR_MAPBOX_API_KEY'` with your actual access token:
   ```javascript
   mapbox: {
     apiKey: 'your_actual_mapbox_token_here',
     // ... rest of config
   }
   ```

## Usage

### For Users

1. **Search for a Location**:
   - Start typing in the location field
   - After 3 characters, location suggestions will appear
   - Click on a suggestion to select it

2. **Use Current Location**:
   - Click the navigation icon (📍) next to the location field
   - Allow location access when prompted
   - Your current address will be automatically filled

3. **Clear Location**:
   - Click the X icon to clear the current location

### For Developers

The `LocationInput` component can be used in any form:

```jsx
import LocationInput from '../UI/LocationInput';

// In your form
<LocationInput
  value={form.location}
  onChange={(location) => setForm(f => ({ ...f, location }))}
  placeholder="Enter location"
  required={true}
/>
```

## Component Features

### Props

- `value`: Current location value
- `onChange`: Callback function when location changes
- `placeholder`: Placeholder text (default: "Enter location")
- `required`: Whether the field is required (default: false)

### Features

- **Debounced Search**: Waits 300ms after typing before searching
- **Loading States**: Shows loading indicators during search and location detection
- **Error Handling**: Graceful fallbacks when services are unavailable
- **Responsive Design**: Works on all screen sizes
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Dark Mode Support**: Automatically adapts to system theme

## Troubleshooting

### Location Permission Denied

If users get "Location access denied":
1. Check if the site is served over HTTPS (required for geolocation)
2. Ask users to enable location services in their browser
3. Provide manual location entry as fallback

### API Service Unavailable

If the configured geocoding service is unavailable:
1. The component will automatically fall back to simple suggestions
2. Users can still manually type locations
3. Check the browser console for specific error messages

### CORS Issues

If you encounter CORS errors:
1. Ensure your API keys have proper domain restrictions
2. For development, add `localhost` to allowed origins
3. Consider using a proxy for development

## Performance Considerations

- **Debouncing**: Search is debounced to avoid excessive API calls
- **Caching**: Consider implementing location caching for frequently searched areas
- **Rate Limiting**: Be aware of API rate limits for paid services
- **Fallbacks**: Always provide fallback options for better user experience

## Security Notes

- **API Key Protection**: Never expose API keys in client-side code for production
- **Domain Restrictions**: Set up proper domain restrictions for your API keys
- **HTTPS Required**: Geolocation API requires HTTPS in production

## Customization

You can customize the appearance by modifying `src/components/UI/LocationInput.css`:

- Colors and themes
- Animation timing
- Responsive breakpoints
- Dark mode styles

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify API key configuration
3. Test with different geocoding services
4. Ensure proper HTTPS setup for production 