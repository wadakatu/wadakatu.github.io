// ===== BLOG ARTICLES MANAGEMENT =====

// Category mapping from Zenn type to display category
const categoryMap = {
  tech: 'Tech',
  idea: 'Life'
};

// Get display category from article
function getCategory(article) {
  if (article.category) return article.category;
  return categoryMap[article.type] || 'Other';
}

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Load articles from JSON
async function loadArticles() {
  try {
    const response = await fetch('/data/articles.json');
    if (!response.ok) throw new Error('Failed to load articles');
    return await response.json();
  } catch (error) {
    console.error('Error loading articles:', error);
    return [];
  }
}

// Filter articles by category
function filterByCategory(articles, category) {
  if (category === 'All') return articles;
  return articles.filter(article => getCategory(article) === category);
}

// Generate article card HTML
function createArticleCard(article) {
  const category = getCategory(article);
  const date = formatDate(article.published_at);
  const topics = article.topics.slice(0, 3).map(t => `#${t}`).join(' ');
  const articleUrl = `/blog/article.html?slug=${article.slug}`;

  return `
    <a href="${articleUrl}" class="article-card">
      <span class="article-emoji">${article.emoji}</span>
      <div class="article-content">
        <h3 class="article-title">${article.title}</h3>
        <div class="article-meta">
          <span class="article-category">${category}</span>
          <span class="article-separator">•</span>
          <span class="article-date">${date}</span>
        </div>
        <div class="article-topics">${topics}</div>
      </div>
      <svg class="article-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    </a>
  `;
}

// Render articles to the container
function renderArticles(articles, container) {
  if (articles.length === 0) {
    container.innerHTML = `
      <div class="no-articles">
        <span class="no-articles-icon">📭</span>
        <p>No articles found in this category.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = articles.map(createArticleCard).join('');
}

// Update active tab
function updateActiveTab(tabs, activeCategory, panel) {
  let activeTab = null;
  tabs.forEach(tab => {
    const isActive = tab.dataset.category === activeCategory;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    tab.tabIndex = isActive ? 0 : -1;
    if (isActive) {
      activeTab = tab;
    }
  });

  if (panel && activeTab) {
    panel.setAttribute('aria-labelledby', activeTab.id);
  }
}

// Update article count
function updateArticleCount(count) {
  const countEl = document.getElementById('article-count');
  if (countEl) {
    countEl.textContent = `${count} articles`;
  }
}

// Initialize blog functionality
async function initBlog() {
  const container = document.getElementById('articles-panel');
  const tabs = document.querySelectorAll('.category-tab');
  const tabList = Array.from(tabs);

  if (!container) return;

  // Load articles
  const articles = await loadArticles();
  let currentCategory = 'All';

  // Initial render
  renderArticles(articles, container);
  updateArticleCount(articles.length);
  updateActiveTab(tabs, currentCategory, container);

  // Setup tab click handlers
  function activateTab(tab) {
    if (!tab) return;
    currentCategory = tab.dataset.category;
    const filtered = filterByCategory(articles, currentCategory);
    renderArticles(filtered, container);
    updateActiveTab(tabs, currentCategory, container);
    updateArticleCount(filtered.length);
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      activateTab(tab);
    });

    tab.addEventListener('keydown', (event) => {
      const { key } = event;
      const currentIndex = tabList.indexOf(tab);
      let nextIndex = currentIndex;

      if (key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % tabList.length;
      } else if (key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + tabList.length) % tabList.length;
      } else if (key === 'Home') {
        nextIndex = 0;
      } else if (key === 'End') {
        nextIndex = tabList.length - 1;
      } else if (key === 'Enter' || key === ' ') {
        event.preventDefault();
        activateTab(tab);
        return;
      } else {
        return;
      }

      event.preventDefault();
      const nextTab = tabList[nextIndex];
      nextTab.focus();
      activateTab(nextTab);
    });
  });
}

// Run on DOM ready
document.addEventListener('DOMContentLoaded', initBlog);
