// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.wadakatu.dev',
  integrations: [sitemap()],
  build: {
    // Generate clean URLs (e.g., /about/ instead of /about.html)
    format: 'directory',
  },
  // Enable View Transitions for smooth page navigation
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  // Compression and optimization
  compressHTML: true,
  vite: {
    build: {
      cssMinify: true,
    },
  },
});
