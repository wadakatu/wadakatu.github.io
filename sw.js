// Service Worker with Workbox
// https://developer.chrome.com/docs/workbox

// Cache version - increment this when assets change
const CACHE_VERSION = '2';

// Try to load Workbox with error handling
let workboxLoaded = false;

try {
  importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');
  workboxLoaded = typeof workbox !== 'undefined';
} catch (error) {
  console.error('Failed to import Workbox:', error);
}

if (workboxLoaded) {
  console.log('Workbox loaded successfully');

  const { registerRoute } = workbox.routing;
  const { CacheFirst, NetworkFirst, StaleWhileRevalidate } = workbox.strategies;
  const { precacheAndRoute, matchPrecache } = workbox.precaching;
  const { ExpirationPlugin } = workbox.expiration;
  const { CacheableResponsePlugin } = workbox.cacheableResponse;

  // =====================
  // Precache Static Assets
  // =====================
  precacheAndRoute([
    { url: '/', revision: CACHE_VERSION },
    { url: '/index.html', revision: CACHE_VERSION },
    { url: '/blog/', revision: CACHE_VERSION },
    { url: '/blog/index.html', revision: CACHE_VERSION },
    { url: '/blog/article.html', revision: CACHE_VERSION },
    { url: '/about/', revision: CACHE_VERSION },
    { url: '/about/index.html', revision: CACHE_VERSION },
    { url: '/projects/', revision: CACHE_VERSION },
    { url: '/projects/index.html', revision: CACHE_VERSION },
    { url: '/styles/common.css', revision: CACHE_VERSION },
    { url: '/styles/toc.css', revision: CACHE_VERSION },
    { url: '/scripts/common.js', revision: CACHE_VERSION },
    { url: '/scripts/blog.js', revision: CACHE_VERSION },
    { url: '/scripts/toc.js', revision: CACHE_VERSION },
    { url: '/ogp.webp', revision: CACHE_VERSION },
    { url: '/images/favicon.ico', revision: CACHE_VERSION },
    { url: '/images/favicon-32.png', revision: CACHE_VERSION },
    { url: '/images/logo-48.webp', revision: CACHE_VERSION },
    { url: '/images/icon-192.png', revision: CACHE_VERSION },
    { url: '/images/icon-512.png', revision: CACHE_VERSION },
    { url: '/offline.html', revision: CACHE_VERSION },
  ]);

  // =====================
  // Cache Strategies
  // =====================

  // CSS & JavaScript - Cache First
  registerRoute(
    ({ request }) =>
      request.destination === 'style' ||
      request.destination === 'script',
    new CacheFirst({
      cacheName: 'static-resources-v' + CACHE_VERSION,
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
      ],
    })
  );

  // Images - Cache First
  registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
      cacheName: 'images-v' + CACHE_VERSION,
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
      ],
    })
  );

  // Google Fonts stylesheets - Stale While Revalidate
  registerRoute(
    ({ url }) => url.origin === 'https://fonts.googleapis.com',
    new StaleWhileRevalidate({
      cacheName: 'google-fonts-stylesheets',
    })
  );

  // Google Fonts webfont files - Cache First (long-term)
  registerRoute(
    ({ url }) => url.origin === 'https://fonts.gstatic.com',
    new CacheFirst({
      cacheName: 'google-fonts-webfonts',
      plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
        new ExpirationPlugin({
          maxEntries: 30,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        }),
      ],
    })
  );

  // CDN resources (marked.js, highlight.js) - Cache First
  registerRoute(
    ({ url }) => url.origin === 'https://cdnjs.cloudflare.com',
    new CacheFirst({
      cacheName: 'cdn-resources',
      plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
        new ExpirationPlugin({
          maxEntries: 30,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        }),
      ],
    })
  );

  // articles.json - Stale While Revalidate
  registerRoute(
    ({ url }) => url.pathname.endsWith('articles.json'),
    new StaleWhileRevalidate({
      cacheName: 'api-data-v' + CACHE_VERSION,
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({
          maxEntries: 10,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        }),
      ],
    })
  );

  // Markdown files - Network First with cache fallback
  registerRoute(
    ({ url }) => url.pathname.endsWith('.md'),
    new NetworkFirst({
      cacheName: 'markdown-content-v' + CACHE_VERSION,
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        }),
      ],
    })
  );

  // =====================
  // Navigation with Offline Fallback
  // =====================

  // Custom navigation handler with proper error handling
  const navigationHandler = async (params) => {
    try {
      // Try network first with cache fallback
      const response = await new NetworkFirst({
        cacheName: 'pages-v' + CACHE_VERSION,
        plugins: [
          new CacheableResponsePlugin({ statuses: [200] }),
          new ExpirationPlugin({
            maxEntries: 20,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          }),
        ],
      }).handle(params);

      return response;
    } catch (error) {
      // Log error for debugging
      console.error('Navigation request failed:', {
        url: params.request.url,
        error: error.message,
      });

      // Try to return offline page from precache
      try {
        const offlinePage = await matchPrecache('/offline.html');
        if (offlinePage) {
          return offlinePage;
        }
        console.error('Offline page not found in precache');
      } catch (fallbackError) {
        console.error('Failed to load offline page:', fallbackError);
      }

      // Last resort: return a basic error response
      return new Response('You are offline and the page is not available.', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
  };

  // Register navigation handler (only once!)
  registerRoute(
    ({ request }) => request.mode === 'navigate',
    navigationHandler
  );

  // =====================
  // Cache Cleanup on Activation
  // =====================

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Delete old versioned caches
              return cacheName.includes('-v') && !cacheName.includes('-v' + CACHE_VERSION);
            })
            .map((cacheName) => {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
    );
  });

} else {
  console.error('Workbox failed to load. Service Worker will not function properly.');

  // Provide basic fetch handler as fallback
  self.addEventListener('fetch', (event) => {
    // Just pass through to network when Workbox fails
    event.respondWith(fetch(event.request));
  });
}
