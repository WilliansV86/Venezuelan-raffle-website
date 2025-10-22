import React from 'react';

/**
 * Instagram Browser Helper - Utility to detect Instagram in-app browser on Android
 * and provide a banner prompting users to open the page in a real browser instead
 */

/**
 * Detects if the current browser is Instagram's in-app browser on Android
 * @returns {boolean} True if running in Instagram's in-app browser on Android
 */
export const isInstagramAndroidBrowser = () => {
  const isInstagramBrowser = 
    navigator.userAgent.includes('Instagram') || 
    (window.navigator.userAgent.indexOf('FBAN') > -1) || 
    (window.navigator.userAgent.indexOf('FBAV') > -1);
  
  const isAndroid = /Android/i.test(navigator.userAgent);
  
  return isInstagramBrowser && isAndroid;
};

/**
 * Adds a banner to the top of the page prompting users to open in a real browser
 * @returns {Function} Cleanup function to remove the banner
 */
export const addInstagramBrowserBanner = () => {
  if (!isInstagramAndroidBrowser()) return () => {};
  
  // Use current URL
  const currentUrl = encodeURIComponent(window.location.href);
  
  // Create banner with direct links to different browsers
  const banner = document.createElement('div');
  banner.id = 'instagram-browser-banner';
  banner.style.position = 'fixed';
  banner.style.top = '0';
  banner.style.left = '0';
  banner.style.width = '100%';
  banner.style.backgroundColor = '#2563eb';
  banner.style.color = 'white';
  banner.style.textAlign = 'center';
  banner.style.padding = '10px';
  banner.style.zIndex = '9999';
  banner.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  
  // Using direct hrefs for multiple browsers
  banner.innerHTML = `
    <p style="margin: 0 0 8px 0; font-weight: bold;">Problemas con el formulario?</p>
    <p style="margin: 0 0 10px 0; font-size: 14px;">Haz clic para abrir en tu navegador:</p>
    <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;">
      <!-- Chrome -->
      <a href="intent://${window.location.host}${window.location.pathname}${window.location.search}#Intent;scheme=https;package=com.android.chrome;end" 
         style="background: #f1f5f9; color: #2563eb; border: none; padding: 8px 16px; border-radius: 5px; font-weight: bold; text-decoration: none; display: flex; align-items: center; white-space: nowrap;">
        <img src="https://www.google.com/chrome/static/images/chrome-logo.svg" width="20" height="20" style="margin-right: 6px;"> 
        Chrome
      </a>
      
      <!-- Samsung Internet -->
      <a href="intent://${window.location.host}${window.location.pathname}${window.location.search}#Intent;scheme=https;package=com.sec.android.app.sbrowser;end" 
         style="background: #f1f5f9; color: #1d4ed8; border: none; padding: 8px 16px; border-radius: 5px; font-weight: bold; text-decoration: none; display: flex; align-items: center; white-space: nowrap;">
        Samsung
      </a>
      
      <!-- Firefox -->
      <a href="intent://${window.location.host}${window.location.pathname}${window.location.search}#Intent;scheme=https;package=org.mozilla.firefox;end" 
         style="background: #f1f5f9; color: #fb7e14; border: none; padding: 8px 16px; border-radius: 5px; font-weight: bold; text-decoration: none; display: flex; align-items: center; white-space: nowrap;">
        Firefox
      </a>
      
      <!-- Direct link with target blank -->
      <a href="${window.location.href}" target="_system" rel="noopener" 
         style="background: #f1f5f9; color: #16a34a; border: none; padding: 8px 16px; border-radius: 5px; font-weight: bold; text-decoration: none; display: flex; align-items: center; white-space: nowrap;">
        Navegador
      </a>
    </div>
  `;
  
  document.body.prepend(banner);
  
  // Add some padding to the top of the body to prevent content from being hidden behind the banner
  const bodyEl = document.querySelector('body');
  const currentPaddingTop = parseInt(window.getComputedStyle(bodyEl).paddingTop, 10);
  bodyEl.style.paddingTop = (currentPaddingTop + banner.offsetHeight) + 'px';
  
  // Return cleanup function
  return () => {
    const banner = document.getElementById('instagram-browser-banner');
    if (banner) {
      banner.remove();
      bodyEl.style.paddingTop = currentPaddingTop + 'px';
    }
  };
};

/**
 * Hook to use Instagram browser detection and banner in React components
 * @returns {boolean} True if running in Instagram's in-app browser on Android
 */
export const useInstagramBrowserDetection = () => {
  const isInInstagram = isInstagramAndroidBrowser();
  
  React.useEffect(() => {
    if (isInInstagram) {
      const cleanup = addInstagramBrowserBanner();
      return cleanup;
    }
  }, [isInInstagram]);
  
  return isInInstagram;
};
