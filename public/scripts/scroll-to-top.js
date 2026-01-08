/**
 * Scroll to Top Button
 * Shows a floating button when scrolled down, scrolls to top on click
 */
(function () {
  'use strict';

  const CONFIG = {
    showThreshold: 300, // Show button after scrolling this many pixels
    throttleMs: 100,    // Throttle scroll events
  };

  let button = null;
  let lastScrollCheck = 0;

  /**
   * Initialize the scroll-to-top button
   */
  function init() {
    button = document.querySelector('.scroll-to-top');
    if (!button) return;

    // Bind click handler
    button.addEventListener('click', scrollToTop);

    // Bind scroll handler with passive listener
    window.addEventListener('scroll', throttledScrollHandler, { passive: true });

    // Initial check
    updateButtonVisibility();
  }

  /**
   * Throttled scroll handler
   */
  function throttledScrollHandler() {
    const now = Date.now();
    if (now - lastScrollCheck < CONFIG.throttleMs) return;
    lastScrollCheck = now;
    updateButtonVisibility();
  }

  /**
   * Update button visibility based on scroll position
   */
  function updateButtonVisibility() {
    if (!button) return;

    const scrollY = window.scrollY || window.pageYOffset;

    if (scrollY > CONFIG.showThreshold) {
      button.classList.add('visible');
    } else {
      button.classList.remove('visible');
    }
  }

  /**
   * Scroll to top of the page
   */
  function scrollToTop() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });

    // Return focus to top of page for accessibility
    const mainContent = document.querySelector('main') || document.body;
    mainContent.focus({ preventScroll: true });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
