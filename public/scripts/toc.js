/**
 * Table of Contents (TOC) - scroll-spy navigation for blog articles
 *
 * Renders a `.tombo-toc` nav (see public/styles/tombo.css §S-05/.tombo-toc,
 * and public/styles/site.css for the h3/h4 indent extension) into the
 * `#toc-rail` slot that blog/[...slug].astro provides. The current entry is
 * marked with `aria-current="location"`, which tombo.css turns into the shu
 * tick mark — no active/blink classes involved.
 *
 * The scroll-spy algorithm itself (updateActiveItem's scan for the last
 * heading above the scroll position, the throttled scroll listener, the
 * reduced-motion-aware smooth scroll) is unchanged from the previous
 * Matrix-styled TOC; only the generated markup/classes and insertion point
 * changed for the TOMBO docs-volume rebuild.
 */
(function () {
  'use strict';

  // Configuration
  const CONFIG = {
    headingSelectors: '.markdown-body h2, .markdown-body h3, .markdown-body h4',
    contentSelector: '.markdown-body',
    tocSlotSelector: '#toc-rail',
    minHeadings: 2,
    scrollOffset: 100,
    throttleMs: 50
  };

  // State
  let headings = [];
  let tocLinks = [];
  let isInitialized = false;
  let prefersReducedMotion = false;

  /**
   * Initialize TOC
   */
  function init() {
    if (isInitialized) return;

    const content = document.querySelector(CONFIG.contentSelector);
    const slot = document.querySelector(CONFIG.tocSlotSelector);
    if (!content || !slot) return;

    // Check for reduced motion preference
    prefersReducedMotion = checkReducedMotion();

    headings = Array.from(document.querySelectorAll(CONFIG.headingSelectors));

    // Don't show TOC for short articles
    if (headings.length < CONFIG.minHeadings) return;

    // Ensure headings have IDs
    assignHeadingIds(headings);

    // Create TOC elements
    createTOC(slot);

    // Set up event listeners
    setupEventListeners();

    // Initial state
    updateActiveItem();

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
   * Create the TOC DOM structure and insert it into the page's TOC slot
   */
  function createTOC(slot) {
    // Narrow viewports drop the sticky rail into the flow ahead of the article,
    // where an expanded list would push the text off screen — so the rail is a
    // disclosure there, standing in for the old modal's "tap to open". Wide
    // viewports have room for the rail, so it opens and the summary is hidden.
    const details = document.createElement('details');
    details.className = 'toc-disclosure';
    details.open = window.matchMedia('(min-width: 901px)').matches;

    const summary = document.createElement('summary');
    summary.className = 'tombo-label';
    summary.textContent = 'Contents';
    details.appendChild(summary);

    const nav = document.createElement('nav');
    nav.className = 'tombo-toc';
    nav.setAttribute('aria-label', 'Table of contents');

    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1), 10);

      const link = document.createElement('a');
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent;
      link.dataset.level = String(level);
      link.dataset.index = String(index);

      // Smooth scroll on click
      link.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToHeading(heading);
      });

      nav.appendChild(link);
      tocLinks.push(link);
    });

    details.appendChild(nav);
    slot.appendChild(details);
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
      }, CONFIG.throttleMs);
    }, { passive: true });
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

    // Mark the current entry — tombo.css turns aria-current into the shu tick
    tocLinks.forEach((link, index) => {
      if (index === activeIndex) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
