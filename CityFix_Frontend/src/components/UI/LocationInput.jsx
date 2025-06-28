import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Search, X } from 'lucide-react';
import { getLocationService, isServiceAvailable } from '../../config/locationConfig';
import './LocationInput.css';

const LocationInput = ({ value, onChange, placeholder = "Enter location", required = false }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const locationService = getLocationService();

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search function using configured service
  const searchPlaces = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      let response;
      
      if (locationService.searchUrl.includes('nominatim')) {
        // Nominatim service
        response = await fetch(
          `${locationService.searchUrl}?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
        );
      } else if (locationService.searchUrl.includes('google')) {
        // Google Places API
        response = await fetch(
          `${locationService.searchUrl}?input=${encodeURIComponent(query)}&key=${locationService.apiKey}&types=geocode`
        );
      } else if (locationService.searchUrl.includes('mapbox')) {
        // Mapbox API
        response = await fetch(
          `${locationService.searchUrl}/${encodeURIComponent(query)}.json?access_token=${locationService.apiKey}&types=address,poi`
        );
      }
      
      if (response && response.ok) {
        const data = await response.json();
        
        if (locationService.searchUrl.includes('nominatim')) {
          // Nominatim response format
          if (data && data.length > 0) {
            const formattedSuggestions = data.map(place => ({
              description: place.display_name,
              lat: place.lat,
              lon: place.lon
            }));
            setSuggestions(formattedSuggestions);
          } else {
            setFallbackSuggestions(query);
          }
        } else if (locationService.searchUrl.includes('google')) {
          // Google Places response format
          if (data.predictions) {
            setSuggestions(data.predictions);
          } else {
            setFallbackSuggestions(query);
          }
        } else if (locationService.searchUrl.includes('mapbox')) {
          // Mapbox response format
          if (data.features && data.features.length > 0) {
            const formattedSuggestions = data.features.map(feature => ({
              description: feature.place_name,
              lat: feature.center[1],
              lon: feature.center[0]
            }));
            setSuggestions(formattedSuggestions);
          } else {
            setFallbackSuggestions(query);
          }
        }
      } else {
        setFallbackSuggestions(query);
      }
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      setFallbackSuggestions(query);
    } finally {
      setIsLoading(false);
    }
  };

  const setFallbackSuggestions = (query) => {
    setSuggestions([
      { description: `${query}, City` },
      { description: `${query}, Street` },
      { description: `${query}, District` }
    ]);
  };

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputValue && inputValue.length >= 3) {
        searchPlaces(inputValue);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputValue]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(true);
    
    if (!newValue) {
      setSuggestions([]);
      onChange('');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion.description);
    onChange(suggestion.description);
    setShowSuggestions(false);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocoding using configured service
          let response;
          
          if (locationService.geocodeUrl.includes('nominatim')) {
            response = await fetch(
              `${locationService.geocodeUrl}?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
            );
          } else if (locationService.geocodeUrl.includes('google')) {
            response = await fetch(
              `${locationService.geocodeUrl}?latlng=${latitude},${longitude}&key=${locationService.apiKey}`
            );
          } else if (locationService.geocodeUrl.includes('mapbox')) {
            response = await fetch(
              `${locationService.geocodeUrl}/${longitude},${latitude}.json?access_token=${locationService.apiKey}`
            );
          }
          
          if (response && response.ok) {
            const data = await response.json();
            
            let address;
            if (locationService.geocodeUrl.includes('nominatim')) {
              address = data.display_name;
            } else if (locationService.geocodeUrl.includes('google')) {
              address = data.results && data.results[0] ? data.results[0].formatted_address : null;
            } else if (locationService.geocodeUrl.includes('mapbox')) {
              address = data.features && data.features[0] ? data.features[0].place_name : null;
            }
            
            if (address) {
              setInputValue(address);
              onChange(address);
            } else {
              setFallbackAddress(latitude, longitude);
            }
          } else {
            setFallbackAddress(latitude, longitude);
          }
        } catch (error) {
          console.error('Error getting address from coordinates:', error);
          setFallbackAddress(position.coords.latitude, position.coords.longitude);
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        let errorMessage = 'Unable to get your location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        alert(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const setFallbackAddress = (latitude, longitude) => {
    const fallbackAddress = `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    setInputValue(fallbackAddress);
    onChange(fallbackAddress);
  };

  const clearLocation = () => {
    setInputValue('');
    onChange('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="location-input-container">
      <div className="location-input-wrapper">
        <div className="location-input-icon">
          <MapPin size={16} />
        </div>
        <input
          ref={inputRef}
          type="text"
          className="location-input"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          required={required}
        />
        <div className="location-input-actions">
          {inputValue && (
            <button
              type="button"
              className="location-clear-btn"
              onClick={clearLocation}
              title="Clear location"
            >
              <X size={14} />
            </button>
          )}
          <button
            type="button"
            className="location-current-btn"
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            title="Use current location"
          >
            <Navigation size={14} />
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="location-loading">
          <div className="location-loading-spinner"></div>
          <span>Searching locations...</span>
        </div>
      )}

      {/* Getting location indicator */}
      {isGettingLocation && (
        <div className="location-loading">
          <div className="location-loading-spinner"></div>
          <span>Getting your location...</span>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div ref={suggestionsRef} className="location-suggestions">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="location-suggestion-item"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <MapPin size={14} />
              <span>{suggestion.description}</span>
            </button>
          ))}
        </div>
      )}

      {/* No suggestions message */}
      {showSuggestions && inputValue && inputValue.length >= 3 && !isLoading && suggestions.length === 0 && (
        <div className="location-no-suggestions">
          <span>No locations found. Try a different search term.</span>
        </div>
      )}
    </div>
  );
};

export default LocationInput; 