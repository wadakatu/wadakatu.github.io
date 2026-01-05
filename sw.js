// Service Worker with Workbox
// https://developer.chrome.com/docs/workbox

importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

// Check if Workbox loaded successfully
if (workbox) {
  console.log('Workbox loaded successfully');

  const { registerRoute, NavigationRoute, setDefaultHandler } = workbox.routing;
  const { CacheFirst, NetworkFirst, StaleWhileRevalidate } = workbox.strategies;
  const { precacheAndRoute, matchPrecache } = workbox.precaching;
  const { ExpirationPlugin } = workbox.expiration;
  const { CacheableResponsePlugin } = workbox.cacheableResponse;

  // =====================
  // Precache Static Assets
  // =====================
  precacheAndRoute([
    { url: '/', revision: '1' },
    { url: '/index.html', revision: '1' },
    { url: '/blog/', revision: '1' },
    { url: '/blog/index.html', revision: '1' },
    { url: '/blog/article.html', revision: '1' },
    { url: '/about/', revision: '1' },
    { url: '/about/index.html', revision: '1' },
    { url: '/projects/', revision: '1' },
    { url: '/projects/index.html', revision: '1' },
    { url: '/styles/common.css', revision: '1' },
    { url: '/scripts/common.js', revision: '1' },
    { url: '/scripts/blog.js', revision: '1' },
    { url: '/ogp.webp', revision: '1' },
    { url: '/offline.html', revision: '1' },
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
      cacheName: 'static-resources',
      plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
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
      cacheName: 'images',
      plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
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
      cacheName: 'api-data',
      plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
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
      cacheName: 'markdown-content',
      plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
        new ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        }),
      ],
    })
  );

  // HTML pages - Network First with offline fallback
  registerRoute(
    ({ request }) => request.mode === 'navigate',
    new NetworkFirst({
      cacheName: 'pages',
      plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
        new ExpirationPlugin({
          maxEntries: 20,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        }),
      ],
    })
  );

  // =====================
  // Offline Fallback
  // =====================

  // Set offline fallback for navigation requests
  const navigationHandler = async (params) => {
    try {
      // Try network first
      return await new NetworkFirst({
        cacheName: 'pages',
        plugins: [
          new CacheableResponsePlugin({ statuses: [0, 200] }),
        ],
      }).handle(params);
    } catch (error) {
      // If both fail, show offline page
      return matchPrecache('/offline.html');
    }
  };

  registerRoute(
    ({ request }) => request.mode === 'navigate',
    navigationHandler
  );

} else {
  console.log('Workbox failed to load');
}
