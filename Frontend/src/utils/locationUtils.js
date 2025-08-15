/**
 * Utility functions for handling location data
 */

/**
 * Formats a location object into a readable string
 * @param {Object|string} location - Location object or string
 * @param {string} fallback - Fallback text if location is invalid
 * @returns {string} Formatted location string
 */
export const formatLocation = (location, fallback = 'Location not specified') => {
  if (!location) return fallback;
  
  // If location is already a string, return it
  if (typeof location === 'string') return location;
  
  // If location is an object, format it
  if (typeof location === 'object') {
    const parts = [];
    
    if (location.street) parts.push(location.street);
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    if (location.postalCode) parts.push(location.postalCode);
    if (location.country) parts.push(location.country);
    
    return parts.length > 0 ? parts.join(', ') : fallback;
  }
  
  return fallback;
};

/**
 * Checks if a location object is valid
 * @param {Object|string} location - Location object or string
 * @returns {boolean} True if location is valid
 */
export const isValidLocation = (location) => {
  if (!location) return false;
  
  if (typeof location === 'string') return location.trim().length > 0;
  
  if (typeof location === 'object') {
    return location.street || location.city || location.state || location.postalCode || location.country;
  }
  
  return false;
};

/**
 * Gets a short location string (city, state)
 * @param {Object|string} location - Location object or string
 * @param {string} fallback - Fallback text if location is invalid
 * @returns {string} Short location string
 */
export const getShortLocation = (location, fallback = 'Location not specified') => {
  if (!location) return fallback;
  
  if (typeof location === 'string') return location;
  
  if (typeof location === 'object') {
    const parts = [];
    
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    
    return parts.length > 0 ? parts.join(', ') : fallback;
  }
  
  return fallback;
};
