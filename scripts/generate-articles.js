#!/usr/bin/env node

/**
 * Generate articles.json from markdown frontmatter
 *
 * Usage: node scripts/generate-articles.js
 */

const fs = require('fs');
const path = require('path');

const ARTICLES_DIR = path.join(__dirname, '..', 'articles');
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'articles.json');

/**
 * Parse YAML frontmatter from markdown content
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const yaml = match[1];
  const data = {};

  // Parse simple YAML (key: value and arrays)
  let currentKey = null;
  let inArray = false;
  const arrayValues = [];

  for (const line of yaml.split('\n')) {
    // Array item
    if (line.match(/^\s+-\s+/)) {
      const value = line.replace(/^\s+-\s+/, '').replace(/^["']|["']$/g, '');
      arrayValues.push(value);
      continue;
    }

    // Save previous array if exists
    if (inArray && currentKey) {
      data[currentKey] = [...arrayValues];
      arrayValues.length = 0;
      inArray = false;
    }

    // Key: value pair
    const kvMatch = line.match(/^(\w+):\s*(.*)$/);
    if (kvMatch) {
      const [, key, value] = kvMatch;
      currentKey = key;

      if (value === '') {
        // Start of array
        inArray = true;
      } else {
        // Parse value
        let parsed = value.replace(/^["']|["']$/g, '');

        // Handle escaped characters in title
        if (key === 'title') {
          parsed = parsed.replace(/\\(.)/g, '$1');
        }

        // Boolean
        if (parsed === 'true') parsed = true;
        else if (parsed === 'false') parsed = false;

        data[key] = parsed;
      }
    }
  }

  // Save last array if exists
  if (inArray && currentKey) {
    data[currentKey] = [...arrayValues];
  }

  return data;
}

/**
 * Calculate reading time from markdown content
 * Japanese: ~500 characters/minute
 */
function calculateReadingTime(content) {
  // Remove frontmatter
  const body = content.replace(/^---[\s\S]*?---\n*/, '');

  // Remove code blocks (they're usually skimmed, not read word-by-word)
  const withoutCode = body.replace(/```[\s\S]*?```/g, '');

  // Remove inline code
  const withoutInlineCode = withoutCode.replace(/`[^`]+`/g, '');

  // Remove URLs
  const withoutUrls = withoutInlineCode.replace(/https?:\/\/[^\s)]+/g, '');

  // Remove markdown syntax
  const plainText = withoutUrls
    .replace(/[#*_\[\]()!]/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  // Count characters (Japanese text)
  const charCount = plainText.length;

  // Calculate reading time (500 chars/min for Japanese)
  const minutes = Math.ceil(charCount / 500);

  // Minimum 1 minute
  return Math.max(1, minutes);
}

/**
 * Parse published_at string to ISO format
 */
function parsePublishedAt(dateStr) {
  if (!dateStr) return null;

  // Handle "2025-08-12 09:47" format
  const match = dateStr.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})$/);
  if (match) {
    return `${match[1]}T${match[2]}:00`;
  }

  return dateStr;
}

/**
 * Main function
 */
function main() {
  // Read all markdown files
  const files = fs.readdirSync(ARTICLES_DIR)
    .filter(f => f.endsWith('.md'));

  const articles = [];

  for (const file of files) {
    const filePath = path.join(ARTICLES_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const frontmatter = parseFrontmatter(content);

    if (!frontmatter) {
      console.warn(`Warning: No frontmatter found in ${file}`);
      continue;
    }

    // Skip unpublished articles
    if (frontmatter.published !== true) {
      console.log(`Skipping unpublished: ${file}`);
      continue;
    }

    const slug = file.replace('.md', '');
    const readingTime = calculateReadingTime(content);

    articles.push({
      slug,
      title: frontmatter.title || '',
      emoji: frontmatter.emoji || '',
      type: frontmatter.type || 'tech',
      topics: frontmatter.topics || [],
      published_at: parsePublishedAt(frontmatter.published_at) || '',
      reading_time: readingTime
    });
  }

  // Sort by published_at (newest first)
  articles.sort((a, b) => {
    if (!a.published_at) return 1;
    if (!b.published_at) return -1;
    return b.published_at.localeCompare(a.published_at);
  });

  // Ensure data directory exists
  const dataDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Write JSON
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(articles, null, 2) + '\n');

  console.log(`Generated ${OUTPUT_FILE} with ${articles.length} articles`);
}

main();
