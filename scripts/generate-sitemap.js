#!/usr/bin/env node

/**
 * Generate sitemap.xml from static pages and articles
 *
 * Usage: node scripts/generate-sitemap.js
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://wadakatu.github.io';
const ARTICLES_JSON = path.join(__dirname, '..', 'data', 'articles.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'sitemap.xml');

// Static pages with their priorities and change frequencies
const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/about/', priority: '0.8', changefreq: 'monthly' },
  { path: '/projects/', priority: '0.8', changefreq: 'monthly' },
  { path: '/blog/', priority: '0.9', changefreq: 'daily' }
];

/**
 * Format date to W3C format (YYYY-MM-DD)
 */
function formatDate(dateString) {
  if (!dateString) return new Date().toISOString().split('T')[0];
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

/**
 * Generate URL entry for sitemap
 */
function generateUrlEntry(url, lastmod, changefreq, priority) {
  return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

/**
 * Main function
 */
function main() {
  const today = new Date().toISOString().split('T')[0];
  const urls = [];

  // Add static pages
  for (const page of STATIC_PAGES) {
    urls.push(generateUrlEntry(
      `${BASE_URL}${page.path}`,
      today,
      page.changefreq,
      page.priority
    ));
  }

  // Add articles
  if (fs.existsSync(ARTICLES_JSON)) {
    const articles = JSON.parse(fs.readFileSync(ARTICLES_JSON, 'utf-8'));

    for (const article of articles) {
      const articleUrl = `${BASE_URL}/blog/article.html?slug=${article.slug}`;
      const lastmod = formatDate(article.published_at);

      urls.push(generateUrlEntry(
        articleUrl,
        lastmod,
        'monthly',
        '0.7'
      ));
    }

    console.log(`Added ${articles.length} articles to sitemap`);
  } else {
    console.warn('Warning: articles.json not found, skipping articles');
  }

  // Generate sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

  fs.writeFileSync(OUTPUT_FILE, sitemap);
  console.log(`Generated ${OUTPUT_FILE} with ${urls.length} URLs`);
}

main();
