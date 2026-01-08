// Service Worker Registration
(function() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('SW registered:', registration.scope);
      })
      .catch(function(error) {
        console.error('SW registration failed:', error);
      });
  }
})();
