// Instagram browser detection and redirect script
(function() {
  // Only run this script once
  if (window.instagramRedirectAttempted) return;
  window.instagramRedirectAttempted = true;
  
  // Detect Instagram browser
  function isInstagramBrowser() {
    return navigator.userAgent.includes('Instagram') || 
      (window.navigator.userAgent.indexOf('FBAN') > -1) || 
      (window.navigator.userAgent.indexOf('FBAV') > -1);
  }
  
  // Detect Android
  function isAndroid() {
    return /Android/i.test(navigator.userAgent);
  }
  
  // If we're in Instagram's browser on Android and not already in a redirect loop
  if (isInstagramBrowser() && isAndroid() && !window.location.href.includes('redirect=true')) {
    // Try different methods to open in external browser
    
    // Method 1: Try using window.open with _system
    try {
      window.open(window.location.href + (window.location.href.includes('?') ? '&' : '?') + 'redirect=true', '_system');
    } catch (e) {
      console.log('Method 1 failed', e);
    }
    
    // Method 2: Try using intent URL for Chrome
    setTimeout(function() {
      var intentUrl = 'intent://' + window.location.host + window.location.pathname + window.location.search + 
                     '#Intent;scheme=https;package=com.android.chrome;end';
      window.location.href = intentUrl;
    }, 100);
    
    // Method 3: Try standard link with target=_blank as fallback
    setTimeout(function() {
      window.location.href = window.location.href + (window.location.href.includes('?') ? '&' : '?') + 'redirect=true';
    }, 300);
  }
})();
