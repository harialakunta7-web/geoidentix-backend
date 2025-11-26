/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Check if a coordinate is within allowed radius of a location
 */
export const isWithinRadius = (
  checkLat: number,
  checkLon: number,
  centerLat: number,
  centerLon: number,
  radiusMeters: number
): boolean => {
  const distance = calculateDistance(checkLat, checkLon, centerLat, centerLon);
  return distance <= radiusMeters;
};

/**
 * Validate latitude
 */
export const isValidLatitude = (lat: number): boolean => {
  return lat >= -90 && lat <= 90;
};

/**
 * Validate longitude
 */
export const isValidLongitude = (lon: number): boolean => {
  return lon >= -180 && lon <= 180;
};

/**
 * Validate coordinates
 */
export const validateCoordinates = (
  lat: number,
  lon: number
): { isValid: boolean; error?: string } => {
  if (!isValidLatitude(lat)) {
    return { isValid: false, error: 'Invalid latitude. Must be between -90 and 90' };
  }
  if (!isValidLongitude(lon)) {
    return { isValid: false, error: 'Invalid longitude. Must be between -180 and 180' };
  }
  return { isValid: true };
};
