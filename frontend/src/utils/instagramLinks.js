/**
 * Utility for generating Instagram-friendly links
 */

/**
 * Creates a URL that will redirect from Instagram's in-app browser
 * to the user's default browser for a better form experience
 * 
 * @param {string} path - The destination path (without leading slash)
 * @param {object} queryParams - Optional query parameters
 * @returns {string} Instagram-friendly URL
 */
export function createInstagramLink(path, queryParams = {}) {
  // Create base link with instagram path prefix
  const instagramPath = `/instagram/${path || ''}`;
  
  // Add query parameters if any
  const queryString = Object.keys(queryParams).length > 0
    ? '?' + new URLSearchParams(queryParams).toString()
    : '';
  
  return `${instagramPath}${queryString}`;
}

/**
 * Check if current browser is Instagram's in-app browser
 * @returns {boolean} True if browser is Instagram's in-app browser
 */
export function isInstagramBrowser() {
  if (typeof navigator === 'undefined') return false;
  
  return (
    navigator.userAgent.includes('Instagram') ||
    (window.navigator.userAgent.indexOf('FBAN') > -1) ||
    (window.navigator.userAgent.indexOf('FBAV') > -1)
  );
}

/**
 * Convert a regular URL to an Instagram-friendly URL
 * @param {string} url - Original URL
 * @returns {string} Instagram-friendly URL
 */
export function convertToInstagramLink(url) {
  try {
    // Parse the URL
    const parsedUrl = new URL(url);
    const path = parsedUrl.pathname.substring(1); // Remove leading slash
    
    // Parse query parameters
    const queryParams = {};
    parsedUrl.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });
    
    // Create Instagram link with the same origin
    return `${parsedUrl.origin}${createInstagramLink(path, queryParams)}`;
  } catch (e) {
    // If URL parsing fails, return the original URL
    return url;
  }
}
