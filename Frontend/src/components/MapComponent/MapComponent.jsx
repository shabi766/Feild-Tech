import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

// Default marker icon fix for leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapSnippet = ({ address }) => {
  const [coordinates, setCoordinates] = useState([51.505, -0.09]); // Default coordinates
  const [loading, setLoading] = useState(false);

  const { street, city, state, postalCode, country } = address;

  // Function to get coordinates from address using an API (e.g., OpenCage Geocoder or Google Maps Geocode)
  const fetchCoordinates = async () => {
    const fullAddress = `${street}, ${city}, ${state}, ${postalCode}, ${country}`;
    setLoading(true);
    
    try {
      const API_KEY = 'YOUR_OPENCAGE_API_KEY'; // Replace with your OpenCageData or Google API key
      const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(fullAddress)}&key=${API_KEY}`);
      const { lat, lng } = response.data.results[0].geometry;
      setCoordinates([lat, lng]);
    } catch (error) {
      console.error('Error fetching coordinates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch coordinates when the address changes
  useEffect(() => {
    if (street && city && country) {
      fetchCoordinates();
    }
  }, [street, city, state, postalCode, country]);

  return (
    <div>
      <h4>Location Map</h4>
      {loading ? (
        <p>Loading map...</p>
      ) : (
        <MapContainer center={coordinates} zoom={13} style={{ height: '400px', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={coordinates}>
            <Popup>
              {street}, {city}, {state}, {postalCode}, {country}
            </Popup>
          </Marker>
        </MapContainer>
      )}
    </div>
  );
};

export default MapSnippet;
