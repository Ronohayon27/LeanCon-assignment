

// Get API URL from environment variable or fallback to localhost
const BASE_API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : "http://localhost:8000/api/v1";

/**
 * Build full URL to a specific API route
 * @param {string} route - e.g. "geometry/2"
 * @returns {string} full URL
 */
function apiUrl() {
  return `${BASE_API_URL}`;
}


export function geometryRoute(){
    return `${apiUrl()}/geometry`
}

export function getIfcRoute(){
  return `${apiUrl()}/ifc`
}

