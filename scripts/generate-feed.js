#!/usr/bin/env node

/**
 * Generate RSS and Atom feeds from articles
 *
 * Usage: node scripts/generate-feed.js
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.wadakatu.dev';
const ARTICLES_JSON = path.join(__dirname, '..', 'data', 'articles.json');
const RSS_OUTPUT = path.join(__dirname, '..', 'feed.xml');
const ATOM_OUTPUT = path.join(__dirname, '..', 'atom.xml');

// Feed metadata
const FEED_CONFIG = {
  title: 'wadakatu Blog',
  description: 'Tech articles and learnings by wadakatu - Laravel, TypeScript, and web development.',
  author: {
    name: 'wadakatu',
    uri: 'https://www.wadakatu.dev'
  },
  language: 'ja',
  copyright: `Copyright ${new Date().getFullYear()} wadakatu`,
  feedUrl: {
    rss: `${BASE_URL}/feed.xml`,
    atom: `${BASE_URL}/atom.xml`
  },
  siteUrl: `${BASE_URL}/blog/`,
  image: `${BASE_URL}/ogp.webp`,
  ttl: 60, // Minutes between feed checks (RSS)
  maxItems: 20 // Limit feed to most recent N articles
};

/**
 * Escape XML special characters
 */
function escapeXml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Format date as RFC-822 (for RSS)
 * Example: "Tue, 10 Dec 2025 13:20:00 +0900"
 */
function formatRfc822(dateString) {
  const date = new Date(dateString);
  return date.toUTCString();
}

/**
 * Format date as ISO-8601 (for Atom)
 * Example: "2025-12-10T13:20:00+09:00"
 */
function formatIso8601(dateString) {
  const date = new Date(dateString);
  return date.toISOString();
}

/**
 * Get category from article type
 */
function getCategory(type) {
  const categoryMap = { tech: 'Tech', idea: 'Life' };
  return categoryMap[type] || 'Other';
}

/**
 * Generate RSS 2.0 feed
 */
function generateRssFeed(articles) {
  const items = articles.slice(0, FEED_CONFIG.maxItems).map(article => {
    const articleUrl = `${BASE_URL}/blog/${article.slug}/`;
    const category = getCategory(article.type);
    const title = `${article.emoji} ${article.title}`;

    // Generate category tags for type and topics
    const categoryTags = [
      `      <category>${escapeXml(category)}</category>`,
      ...article.topics.map(topic => `      <category>${escapeXml(topic)}</category>`)
    ].join('\n');

    return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <pubDate>${formatRfc822(article.published_at)}</pubDate>
${categoryTags}
    </item>`;
  });

  const lastBuildDate = formatRfc822(new Date().toISOString());

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(FEED_CONFIG.title)}</title>
    <link>${FEED_CONFIG.siteUrl}</link>
    <description>${escapeXml(FEED_CONFIG.description)}</description>
    <language>${FEED_CONFIG.language}</language>
    <copyright>${escapeXml(FEED_CONFIG.copyright)}</copyright>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <ttl>${FEED_CONFIG.ttl}</ttl>
    <image>
      <url>${FEED_CONFIG.image}</url>
      <title>${escapeXml(FEED_CONFIG.title)}</title>
      <link>${FEED_CONFIG.siteUrl}</link>
    </image>
    <atom:link href="${FEED_CONFIG.feedUrl.rss}" rel="self" type="application/rss+xml"/>
${items.join('\n')}
  </channel>
</rss>
`;
}

/**
 * Generate Atom 1.0 feed
 */
function generateAtomFeed(articles) {
  const entries = articles.slice(0, FEED_CONFIG.maxItems).map(article => {
    const articleUrl = `${BASE_URL}/blog/${article.slug}/`;
    const category = getCategory(article.type);
    const title = `${article.emoji} ${article.title}`;

    // Generate category tags for type and topics
    const categoryTags = [
      `    <category term="${escapeXml(category)}"/>`,
      ...article.topics.map(topic => `    <category term="${escapeXml(topic)}"/>`)
    ].join('\n');

    return `  <entry>
    <title>${escapeXml(title)}</title>
    <link href="${articleUrl}" rel="alternate" type="text/html"/>
    <id>${articleUrl}</id>
    <published>${formatIso8601(article.published_at)}</published>
    <updated>${formatIso8601(article.published_at)}</updated>
    <author>
      <name>${escapeXml(FEED_CONFIG.author.name)}</name>
      <uri>${FEED_CONFIG.author.uri}</uri>
    </author>
${categoryTags}
  </entry>`;
  });

  // Use latest article's date as feed updated time, or current time if no articles
  const updated = articles.length > 0
    ? formatIso8601(articles[0].published_at)
    : formatIso8601(new Date().toISOString());

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(FEED_CONFIG.title)}</title>
  <subtitle>${escapeXml(FEED_CONFIG.description)}</subtitle>
  <link href="${FEED_CONFIG.siteUrl}" rel="alternate" type="text/html"/>
  <link href="${FEED_CONFIG.feedUrl.atom}" rel="self" type="application/atom+xml"/>
  <id>${FEED_CONFIG.siteUrl}</id>
  <updated>${updated}</updated>
  <author>
    <name>${escapeXml(FEED_CONFIG.author.name)}</name>
    <uri>${FEED_CONFIG.author.uri}</uri>
  </author>
  <rights>${escapeXml(FEED_CONFIG.copyright)}</rights>
  <icon>${FEED_CONFIG.image}</icon>
  <logo>${FEED_CONFIG.image}</logo>
${entries.join('\n')}
</feed>
`;
}

/**
 * Main function
 */
function main() {
  console.log('Generating RSS and Atom feeds...\n');

  // Load articles
  if (!fs.existsSync(ARTICLES_JSON)) {
    console.error('Error: articles.json not found. Run generate-articles.js first.');
    process.exit(1);
  }

  const articles = JSON.parse(fs.readFileSync(ARTICLES_JSON, 'utf-8'));
  console.log(`Found ${articles.length} articles`);

  // Generate RSS feed
  const rss = generateRssFeed(articles);
  fs.writeFileSync(RSS_OUTPUT, rss);
  console.log(`✓ Generated ${RSS_OUTPUT}`);

  // Generate Atom feed
  const atom = generateAtomFeed(articles);
  fs.writeFileSync(ATOM_OUTPUT, atom);
  console.log(`✓ Generated ${ATOM_OUTPUT}`);

  console.log('\nDone! 🎉');
}

main();
