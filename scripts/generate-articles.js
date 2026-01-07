#!/usr/bin/env node

/**
 * Generate articles.json and static HTML pages from markdown
 *
 * Usage: node scripts/generate-articles.js
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const hljs = require('highlight.js');

const ARTICLES_DIR = path.join(__dirname, '..', 'articles');
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'articles.json');
const BLOG_DIR = path.join(__dirname, '..', 'blog');
const BASE_URL = 'https://www.wadakatu.dev';

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
 * Get category name from article type
 */
function getCategory(type) {
  const categoryMap = {
    tech: 'Tech',
    idea: 'Life'
  };
  return categoryMap[type] || 'Other';
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Configure marked with syntax highlighting
 */
function configureMarked() {
  marked.setOptions({
    highlight: function(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    },
    breaks: true,
    gfm: true
  });
}

/**
 * Generate static HTML for an article
 */
function generateArticleHTML(article, markdownContent) {
  // Remove frontmatter
  const content = markdownContent.replace(/^---[\s\S]*?---\n*/, '');

  // Parse markdown to HTML
  const htmlContent = marked.parse(content);

  const category = getCategory(article.type);
  const date = formatDate(article.published_at);
  const zennUrl = `https://zenn.dev/wadakatu/articles/${article.slug}`;
  const articleUrl = `${BASE_URL}/blog/${article.slug}/`;
  const description = escapeHtml(`${article.title} - Tech article by wadakatu`);
  const title = escapeHtml(article.title);

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | wadakatu</title>
  <meta name="description" content="${description}">
  <meta name="author" content="wadakatu">

  <!-- OGP -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${articleUrl}">
  <meta property="og:title" content="${title} | wadakatu">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${BASE_URL}/ogp.webp">
  <meta property="og:image:alt" content="wadakatu - Backend Developer portfolio preview">
  <meta property="og:site_name" content="wadakatu">
  <meta property="og:locale" content="ja_JP">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@koyolympus">
  <meta name="twitter:title" content="${title} | wadakatu">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${BASE_URL}/ogp.webp">
  <meta name="twitter:image:alt" content="wadakatu - Backend Developer portfolio preview">

  <!-- Canonical URL -->
  <link rel="canonical" href="${articleUrl}">

  <!-- Favicon -->
  <link rel="icon" type="image/webp" href="/ogp.webp">

  <!-- PWA Manifest -->
  <link rel="manifest" href="/manifest.json">

  <!-- Preconnect to external resources -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <!-- Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@400;500;600&family=Noto+Sans+JP:wght@400;500;600&display=swap" rel="stylesheet">

  <!-- Highlight.js for syntax highlighting -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css">

  <link rel="stylesheet" href="/styles/common.css">
  ${getArticleStyles()}
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <canvas id="matrix-rain" aria-hidden="true"></canvas>

  <div class="container">
    <header class="page-header">
      <a href="/blog/" class="back-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        cd ../blog
      </a>
    </header>

    <main class="article-container" id="main-content">
      <header class="article-header">
        <span class="article-emoji">${article.emoji}</span>
        <h1 class="article-title">${article.title}</h1>
        <div class="article-meta">
          <span class="article-category">${category}</span>
          <span class="article-date">${date}</span>
          <span class="article-reading-time">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            ${article.reading_time} min read
          </span>
        </div>
        <div class="article-topics">
          ${article.topics.map(t => `<span class="topic-tag">#${t}</span>`).join('')}
        </div>
      </header>

      <div class="zenn-bar">
        <span class="zenn-bar-text">
          <span class="terminal-prefix">$</span>
          This article is also available on Zenn
        </span>
        <a href="${zennUrl}" target="_blank" rel="noopener noreferrer" class="zenn-link">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M.264 23.771h4.984c.264 0 .498-.147.645-.352L19.614.874c.176-.293-.029-.645-.381-.645h-4.72c-.235 0-.44.117-.557.323L.03 23.361c-.088.176.029.41.234.41zM17.445 23.419l6.479-10.408c.205-.323-.029-.733-.41-.733h-4.691c-.176 0-.352.088-.44.235l-6.655 10.643c-.176.264.029.616.352.616h4.779c.234-.001.468-.118.586-.353z"/>
          </svg>
          Read on Zenn
        </a>
      </div>

      <article class="article-content">
        <div class="markdown-body">
          ${htmlContent}
        </div>
      </article>

      <footer class="article-footer">
        <nav class="article-footer-nav">
          <a href="/blog/" class="nav-button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Blog
          </a>
          <a href="${zennUrl}" target="_blank" rel="noopener noreferrer" class="nav-button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Open in Zenn
          </a>
        </nav>
      </footer>
    </main>

    <footer class="footer">
      <div class="footer-brand">
        <img src="/ogp.webp" alt="wadakatu logo" class="footer-logo" width="48" height="48">
        <div class="footer-info">
          <span class="footer-name">wadakatu_</span>
          <a href="https://chisatosatoh.myportfolio.com/work" target="_blank" class="footer-credit">Logo by Chisato Satoh</a>
        </div>
      </div>
      <div class="footer-status">
        <div class="uplink">
          <span class="uplink-dot"></span>
          <span>UPLINK ACTIVE</span>
        </div>
        <span class="footer-time" id="jst-time">--:--:-- JST</span>
      </div>
    </footer>
  </div>

  <script src="/scripts/common.js"></script>
  <script src="/scripts/code-copy.js"></script>
  <script src="/scripts/sw-register.js"></script>

  <noscript>
    <style>
      #matrix-rain { display: none; }
      body::before { display: none; }
      .page-header, .article-header, .zenn-bar, .article-content, .article-footer, .footer {
        opacity: 1;
        transform: none;
      }
    </style>
    <div style="text-align: center; padding: 3rem; font-family: 'JetBrains Mono', monospace; color: #888;">
      <p>JavaScript is required for interactive features.</p>
      <p style="margin-top: 1rem;">
        <a href="/blog/" style="color: #00ff41;">Return to Blog</a> or
        <a href="https://zenn.dev/wadakatu" style="color: #00ff41;">Visit Zenn</a>
      </p>
    </div>
  </noscript>
</body>
</html>`;
}

/**
 * Get article page styles (extracted from article.html)
 */
function getArticleStyles() {
  return `  <style>
    /* ===== ARTICLE PAGE STYLES ===== */

    body {
      font-family: 'Noto Sans JP', 'Outfit', sans-serif;
    }

    .article-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    /* ===== ARTICLE HEADER ===== */
    .article-header {
      text-align: center;
      padding: 2rem 0 3rem;
      border-bottom: 1px solid var(--border);
      position: relative;
    }

    .article-header::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--matrix), transparent);
      box-shadow: var(--glow);
    }

    .article-emoji {
      font-size: 4rem;
      line-height: 1;
      margin-bottom: 1.5rem;
      display: block;
      filter: drop-shadow(0 0 20px rgba(0, 255, 65, 0.3));
    }

    .article-title {
      font-size: clamp(1.5rem, 4vw, 2.25rem);
      font-weight: 600;
      line-height: 1.4;
      margin-bottom: 1.5rem;
      color: var(--text);
    }

    .article-meta {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .article-category {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--bg);
      background: var(--matrix);
      padding: 0.3rem 0.75rem;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .article-date {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      color: var(--text-dim);
    }

    .article-reading-time {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      color: var(--text-dim);
    }

    .article-reading-time svg {
      width: 14px;
      height: 14px;
      color: var(--matrix);
      opacity: 0.7;
    }

    .article-topics {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.5rem;
    }

    .topic-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      color: var(--matrix-dim);
      background: var(--card);
      border: 1px solid var(--border);
      padding: 0.35rem 0.75rem;
      border-radius: 20px;
      transition: all 0.3s ease;
    }

    .topic-tag:hover {
      border-color: var(--matrix-dark);
      color: var(--matrix);
    }

    /* ===== ZENN LINK BAR ===== */
    .zenn-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem 1.5rem;
      background: linear-gradient(135deg, var(--card) 0%, rgba(0, 255, 65, 0.03) 100%);
      border: 1px solid var(--border);
      border-radius: 12px;
      flex-wrap: wrap;
    }

    .zenn-bar-text {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      color: var(--text-dim);
    }

    .zenn-bar-text .terminal-prefix {
      color: var(--matrix);
      margin-right: 0.5rem;
    }

    .zenn-link {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--text);
      background: var(--matrix-dark);
      border: 1px solid var(--matrix-dim);
      padding: 0.6rem 1.25rem;
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.3s ease;
    }

    .zenn-link:hover {
      background: var(--matrix);
      color: var(--bg);
      box-shadow: var(--glow-strong);
      transform: translateY(-2px);
    }

    .zenn-link svg {
      width: 16px;
      height: 16px;
    }

    /* ===== ARTICLE CONTENT ===== */
    .article-content {
      max-width: 720px;
      margin: 0 auto;
      padding: 2rem 0;
    }

    /* Markdown Body Styles */
    .markdown-body {
      font-size: 1.05rem;
      line-height: 1.85;
      color: var(--text);
    }

    /* Headings */
    .markdown-body h1,
    .markdown-body h2,
    .markdown-body h3,
    .markdown-body h4 {
      font-family: 'Outfit', 'Noto Sans JP', sans-serif;
      font-weight: 600;
      color: var(--text);
      margin-top: 2.5rem;
      margin-bottom: 1rem;
      line-height: 1.4;
      position: relative;
    }

    .markdown-body h2 {
      font-size: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border);
    }

    .markdown-body h2::before {
      content: '## ';
      font-family: 'JetBrains Mono', monospace;
      color: var(--matrix);
      opacity: 0.6;
      font-size: 0.9em;
    }

    .markdown-body h3 {
      font-size: 1.25rem;
    }

    .markdown-body h3::before {
      content: '### ';
      font-family: 'JetBrains Mono', monospace;
      color: var(--matrix);
      opacity: 0.5;
      font-size: 0.85em;
    }

    .markdown-body h4 {
      font-size: 1.1rem;
    }

    /* Paragraphs */
    .markdown-body p {
      margin-bottom: 1.5rem;
    }

    /* Links */
    .markdown-body a {
      color: var(--matrix);
      text-decoration: none;
      border-bottom: 1px solid var(--matrix-dark);
      transition: all 0.2s ease;
    }

    .markdown-body a:hover {
      color: #4dff7c;
      border-bottom-color: var(--matrix);
      text-shadow: 0 0 8px rgba(0, 255, 65, 0.5);
    }

    /* Lists */
    .markdown-body ul,
    .markdown-body ol {
      margin-bottom: 1.5rem;
      padding-left: 1.5rem;
    }

    .markdown-body li {
      margin-bottom: 0.5rem;
    }

    .markdown-body ul li::marker {
      color: var(--matrix);
    }

    .markdown-body ol li::marker {
      color: var(--matrix);
      font-family: 'JetBrains Mono', monospace;
    }

    /* Code - Inline */
    .markdown-body code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.9em;
      background: var(--card);
      border: 1px solid var(--border);
      padding: 0.2em 0.5em;
      border-radius: 4px;
      color: var(--matrix);
    }

    /* Code - Block */
    .markdown-body pre {
      margin: 1.5rem 0 2rem;
      border-radius: 12px;
      overflow: hidden;
      position: relative;
      border: 1px solid var(--border);
    }

    .markdown-body pre::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--matrix), var(--matrix-dim), var(--matrix));
      opacity: 0.6;
    }

    .markdown-body pre code {
      display: block;
      padding: 1.5rem;
      font-size: 0.85rem;
      line-height: 1.6;
      background: #1a1b26;
      border: none;
      overflow-x: auto;
      color: #c0caf5;
    }

    /* ===== CODE COPY BUTTON ===== */
    .code-copy-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      color: var(--text-dim);
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid var(--border);
      border-radius: 6px;
      cursor: pointer;
      opacity: 0;
      transform: translateY(-4px);
      transition: all 0.25s ease;
      z-index: 10;
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
    }

    .markdown-body pre:hover .code-copy-btn,
    .code-copy-btn:focus {
      opacity: 1;
      transform: translateY(0);
    }

    .code-copy-btn:hover {
      color: var(--matrix);
      border-color: var(--matrix-dark);
      background: rgba(0, 255, 65, 0.08);
      box-shadow:
        0 0 20px rgba(0, 255, 65, 0.15),
        inset 0 0 20px rgba(0, 255, 65, 0.05);
    }

    .code-copy-btn .copy-icon,
    .code-copy-btn .check-icon {
      width: 14px;
      height: 14px;
      transition: all 0.2s ease;
    }

    .code-copy-btn .check-icon {
      display: none;
    }

    .code-copy-btn.copied {
      color: var(--matrix);
      border-color: var(--matrix-dim);
      background: rgba(0, 255, 65, 0.12);
      box-shadow:
        0 0 25px rgba(0, 255, 65, 0.25),
        inset 0 0 15px rgba(0, 255, 65, 0.1);
      opacity: 1;
      transform: translateY(0);
    }

    .code-copy-btn.copied .copy-icon {
      display: none;
    }

    .code-copy-btn.copied .check-icon {
      display: block;
      animation: checkPop 0.3s ease;
    }

    .code-copy-btn .btn-label {
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    @keyframes checkPop {
      0% { transform: scale(0.5); opacity: 0; }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); opacity: 1; }
    }

    @keyframes glowPulse {
      0%, 100% {
        box-shadow:
          0 0 20px rgba(0, 255, 65, 0.2),
          inset 0 0 15px rgba(0, 255, 65, 0.1);
      }
      50% {
        box-shadow:
          0 0 30px rgba(0, 255, 65, 0.35),
          inset 0 0 20px rgba(0, 255, 65, 0.15);
      }
    }

    .code-copy-btn.copied {
      animation: glowPulse 0.6s ease;
    }

    .code-copy-btn:focus-visible {
      outline: 2px solid var(--matrix);
      outline-offset: 2px;
      opacity: 1;
      transform: translateY(0);
    }

    @media (max-width: 768px) {
      .code-copy-btn {
        opacity: 1;
        transform: translateY(0);
        padding: 8px 12px;
      }
    }

    /* Blockquote */
    .markdown-body blockquote {
      margin: 1.5rem 0;
      padding: 1rem 1.5rem;
      border-left: 3px solid var(--matrix);
      background: linear-gradient(90deg, rgba(0, 255, 65, 0.05), transparent);
      border-radius: 0 8px 8px 0;
    }

    .markdown-body blockquote p {
      margin-bottom: 0;
      color: var(--text-dim);
      font-style: italic;
    }

    /* Images */
    .markdown-body img {
      max-width: 100%;
      height: auto;
      border-radius: 12px;
      margin: 1.5rem 0;
      border: 1px solid var(--border);
    }

    /* Horizontal Rule */
    .markdown-body hr {
      border: none;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--border), var(--matrix-dark), var(--border), transparent);
      margin: 3rem 0;
    }

    /* Tables */
    .markdown-body table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
      font-size: 0.95rem;
    }

    .markdown-body th,
    .markdown-body td {
      padding: 0.75rem 1rem;
      border: 1px solid var(--border);
      text-align: left;
    }

    .markdown-body th {
      background: var(--card);
      font-weight: 600;
      color: var(--matrix);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
    }

    .markdown-body tr:hover td {
      background: rgba(0, 255, 65, 0.03);
    }

    /* Strong & Emphasis */
    .markdown-body strong {
      color: var(--text);
      font-weight: 600;
    }

    .markdown-body em {
      font-style: italic;
      color: var(--text-dim);
    }

    /* ===== ARTICLE FOOTER ===== */
    .article-footer {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid var(--border);
    }

    .article-footer-nav {
      display: flex;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .nav-button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      color: var(--text-dim);
      background: var(--card);
      border: 1px solid var(--border);
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.3s ease;
    }

    .nav-button:hover {
      color: var(--matrix);
      border-color: var(--matrix-dark);
      box-shadow: var(--glow);
    }

    .nav-button svg {
      width: 16px;
      height: 16px;
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 768px) {
      .article-header {
        padding: 1.5rem 0 2rem;
      }

      .article-emoji {
        font-size: 3rem;
      }

      .article-title {
        font-size: 1.35rem;
      }

      .zenn-bar {
        flex-direction: column;
        text-align: center;
      }

      .markdown-body {
        font-size: 1rem;
      }

      .markdown-body pre code {
        font-size: 0.8rem;
        padding: 1rem;
      }

      .article-footer-nav {
        flex-direction: column;
      }

      .nav-button {
        justify-content: center;
      }
    }

    /* ===== ANIMATIONS ===== */
    .article-header,
    .zenn-bar,
    .article-content,
    .article-footer {
      opacity: 0;
      transform: translateY(20px);
      animation: fadeUp 0.6s ease-out forwards;
    }

    .article-header { animation-delay: 0.1s; }
    .zenn-bar { animation-delay: 0.2s; }
    .article-content { animation-delay: 0.3s; }
    .article-footer { animation-delay: 0.4s; }

    /* Skip Link */
    .skip-link {
      position: absolute;
      top: -100%;
      left: 50%;
      transform: translateX(-50%);
      background: var(--matrix);
      color: var(--bg);
      padding: 0.75rem 1.5rem;
      border-radius: 0 0 8px 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      font-weight: 600;
      text-decoration: none;
      z-index: 10000;
      transition: top 0.3s ease;
    }

    .skip-link:focus {
      top: 0;
      outline: 2px solid var(--text);
      outline-offset: 2px;
    }
  </style>`;
}

/**
 * Get code copy button script
 */

/**
 * Write static article page
 */
function writeArticlePage(slug, html) {
  const articleDir = path.join(BLOG_DIR, slug);
  if (!fs.existsSync(articleDir)) {
    fs.mkdirSync(articleDir, { recursive: true });
  }
  const outputPath = path.join(articleDir, 'index.html');
  fs.writeFileSync(outputPath, html);
  console.log(`  Generated: /blog/${slug}/index.html`);
}

/**
 * Main function
 */
function main() {
  console.log('Generating articles.json and static HTML pages...\n');

  // Configure marked
  configureMarked();

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

    const article = {
      slug,
      title: frontmatter.title || '',
      emoji: frontmatter.emoji || '',
      type: frontmatter.type || 'tech',
      topics: frontmatter.topics || [],
      published_at: parsePublishedAt(frontmatter.published_at) || '',
      reading_time: readingTime
    };

    articles.push(article);

    // Generate static HTML for this article
    const html = generateArticleHTML(article, content);
    writeArticlePage(slug, html);
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

  console.log(`\n✓ Generated ${OUTPUT_FILE} with ${articles.length} articles`);
  console.log(`✓ Generated ${articles.length} static HTML pages`);
}

main();
