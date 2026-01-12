/**
 * Table of Contents (TOC) - Matrix Terminal Style
 * Dynamic navigation for blog articles
 */

(function () {
  'use strict';

  // Configuration
  const CONFIG = {
    headingSelectors: '.markdown-body h2, .markdown-body h3, .markdown-body h4',
    contentSelector: '.markdown-body',
    minHeadings: 2,
    scrollOffset: 100,
    throttleMs: 50
  };

  // State
  let tocElement = null;
  let tocList = null;
  let progressBar = null;
  let headings = [];
  let tocItems = [];
  let mobileBackdrop = null;
  let mobileTrigger = null;
  let isInitialized = false;
  let prefersReducedMotion = false;

  /**
   * Initialize TOC
   */
  function init() {
    if (isInitialized) return;

    const content = document.querySelector(CONFIG.contentSelector);
    if (!content) return;

    // Check for reduced motion preference
    prefersReducedMotion = checkReducedMotion();

    headings = Array.from(document.querySelectorAll(CONFIG.headingSelectors));

    // Don't show TOC for short articles
    if (headings.length < CONFIG.minHeadings) return;

    // Ensure headings have IDs
    assignHeadingIds(headings);

    // Create TOC elements
    createTOC();
    createMobileElements();

    // Set up event listeners
    setupEventListeners();

    // Initial state
    updateActiveItem();
    updateProgressBar();

    isInitialized = true;
  }

  /**
   * Assign unique IDs to headings that don't have one
   */
  function assignHeadingIds(headings) {
    const usedIds = new Set();

    headings.forEach((heading, index) => {
      if (!heading.id) {
        let baseId = heading.textContent
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .substring(0, 50);

        // Ensure unique ID
        let id = baseId || `section-${index}`;
        let counter = 1;
        while (usedIds.has(id)) {
          id = `${baseId}-${counter}`;
          counter++;
        }

        heading.id = id;
        usedIds.add(id);
      } else {
        usedIds.add(heading.id);
      }
    });
  }

  /**
   * Create the TOC DOM structure
   */
  function createTOC() {
    // Create container
    tocElement = document.createElement('nav');
    tocElement.className = 'toc';
    tocElement.setAttribute('aria-label', 'Table of contents');

    // Header
    const header = document.createElement('div');
    header.className = 'toc-header';
    header.innerHTML = `
      <span class="toc-comment">// TABLE_OF_CONTENTS</span>
      <button class="toc-toggle" aria-expanded="true" aria-label="Toggle table of contents">
        <span class="toc-toggle-icon"></span>
      </button>
    `;

    // List container
    tocList = document.createElement('ul');
    tocList.className = 'toc-list';
    tocList.setAttribute('role', 'list');

    // Generate list items
    headings.forEach((heading, index) => {
      const item = createTOCItem(heading, index);
      tocList.appendChild(item);
      tocItems.push(item);
    });

    // Progress bar
    const progress = document.createElement('div');
    progress.className = 'toc-progress';
    progress.innerHTML = '<div class="toc-progress-bar"></div>';
    progressBar = progress.querySelector('.toc-progress-bar');

    // Assemble
    tocElement.appendChild(header);
    tocElement.appendChild(tocList);
    tocElement.appendChild(progress);

    // Add to page
    document.body.appendChild(tocElement);

    // Set up toggle
    const toggleBtn = header.querySelector('.toc-toggle');
    toggleBtn.addEventListener('click', toggleCollapse);
  }

  /**
   * Create a single TOC item
   */
  function createTOCItem(heading, index) {
    const level = parseInt(heading.tagName.charAt(1));
    const prefix = level === 2 ? '$' : level === 3 ? '>' : '·';

    const item = document.createElement('li');
    item.className = `toc-item toc-h${level}`;
    item.dataset.index = index;

    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.innerHTML = `
      <span class="toc-prefix">${prefix}</span>
      <span class="toc-text">${escapeHtml(heading.textContent)}</span>
      <span class="toc-cursor"></span>
    `;

    // Smooth scroll on click
    link.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToHeading(heading);
      closeMobileTOC();
    });

    item.appendChild(link);
    return item;
  }

  /**
   * Create mobile trigger button and backdrop
   */
  function createMobileElements() {
    // Backdrop
    mobileBackdrop = document.createElement('div');
    mobileBackdrop.className = 'toc-backdrop';
    mobileBackdrop.addEventListener('click', closeMobileTOC);
    document.body.appendChild(mobileBackdrop);

    // Trigger button
    mobileTrigger = document.createElement('button');
    mobileTrigger.className = 'toc-mobile-trigger';
    mobileTrigger.setAttribute('aria-label', 'Open table of contents');
    mobileTrigger.innerHTML = '☰';
    mobileTrigger.addEventListener('click', openMobileTOC);
    document.body.appendChild(mobileTrigger);
  }

  /**
   * Set up event listeners
   */
  function setupEventListeners() {
    // Throttled scroll handler
    let scrollTimeout = null;
    window.addEventListener('scroll', () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        scrollTimeout = null;
        updateActiveItem();
        updateProgressBar();
      }, CONFIG.throttleMs);
    }, { passive: true });

    // Keyboard navigation for mobile TOC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && tocElement.classList.contains('mobile-open')) {
        closeMobileTOC();
      }
    });
  }

  /**
   * Toggle TOC collapse state
   */
  function toggleCollapse() {
    const isCollapsed = tocElement.classList.toggle('collapsed');
    const toggleBtn = tocElement.querySelector('.toc-toggle');
    toggleBtn.setAttribute('aria-expanded', !isCollapsed);
  }

  /**
   * Open mobile TOC modal
   */
  function openMobileTOC() {
    tocElement.classList.add('mobile-open');
    mobileBackdrop.classList.add('visible');
    document.body.style.overflow = 'hidden';

    // Focus first link
    const firstLink = tocList.querySelector('a');
    if (firstLink) firstLink.focus();
  }

  /**
   * Close mobile TOC modal
   */
  function closeMobileTOC() {
    tocElement.classList.remove('mobile-open');
    mobileBackdrop.classList.remove('visible');
    document.body.style.overflow = '';
  }

  /**
   * Check if user prefers reduced motion
   * Uses both CSS media query and JavaScript check for comprehensive coverage
   */
  function checkReducedMotion() {
    // Check via matchMedia (handles both CSS preference and JS-triggered check)
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

      // Listen for changes to the preference
      mediaQuery.addEventListener('change', (e) => {
        prefersReducedMotion = e.matches;
      });

      return mediaQuery.matches;
    }
    return false;
  }

  /**
   * Get scroll behavior based on user preference
   */
  function getScrollBehavior() {
    return prefersReducedMotion ? 'auto' : 'smooth';
  }

  /**
   * Scroll to heading with offset
   */
  function scrollToHeading(heading) {
    const top = heading.getBoundingClientRect().top + window.pageYOffset - CONFIG.scrollOffset;
    window.scrollTo({
      top: top,
      behavior: getScrollBehavior()
    });
  }

  /**
   * Update active TOC item based on scroll position
   */
  function updateActiveItem() {
    const scrollPos = window.scrollY + CONFIG.scrollOffset + 20;

    let activeIndex = 0;

    // Find the last heading that's above the current scroll position
    for (let i = 0; i < headings.length; i++) {
      const heading = headings[i];
      const headingTop = heading.getBoundingClientRect().top + window.pageYOffset;

      if (headingTop <= scrollPos) {
        activeIndex = i;
      } else {
        break;
      }
    }

    // Update active class
    tocItems.forEach((item, index) => {
      item.classList.toggle('active', index === activeIndex);
    });

    // Scroll active item into view in TOC list
    const activeItem = tocItems[activeIndex];
    if (activeItem && tocList) {
      const itemRect = activeItem.getBoundingClientRect();
      const listRect = tocList.getBoundingClientRect();

      if (itemRect.top < listRect.top || itemRect.bottom > listRect.bottom) {
        activeItem.scrollIntoView({ block: 'nearest', behavior: getScrollBehavior() });
      }
    }
  }

  /**
   * Update reading progress bar
   */
  function updateProgressBar() {
    if (!progressBar) return;

    const content = document.querySelector(CONFIG.contentSelector);
    if (!content) return;

    const contentRect = content.getBoundingClientRect();
    const contentTop = contentRect.top + window.pageYOffset;
    const contentHeight = contentRect.height;
    const windowHeight = window.innerHeight;
    const scrollY = window.scrollY;

    // Calculate progress
    const scrollStart = contentTop;
    const scrollEnd = contentTop + contentHeight - windowHeight;
    const scrollRange = scrollEnd - scrollStart;

    let progress = 0;
    if (scrollY <= scrollStart) {
      progress = 0;
    } else if (scrollY >= scrollEnd) {
      progress = 100;
    } else {
      progress = ((scrollY - scrollStart) / scrollRange) * 100;
    }

    progressBar.style.width = `${progress}%`;
  }

  /**
   * Escape HTML special characters
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
