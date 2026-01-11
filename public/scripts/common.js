// ===== MATRIX RAIN EFFECT =====
const MATRIX_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789'.split('');
const MATRIX_FONT_SIZE = 14;
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

let matrixAnimationId = null;
let matrixDrawFn = null;

function initMatrixRain() {
  const canvas = document.getElementById('matrix-rain');
  if (!canvas || reducedMotionQuery.matches) return;

  if (matrixAnimationId) {
    cancelAnimationFrame(matrixAnimationId);
    matrixAnimationId = null;
  }

  const ctx = canvas.getContext('2d');
  let drops = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const columns = Math.floor(canvas.width / MATRIX_FONT_SIZE);
    drops = Array(columns).fill(0).map(() => Math.random() * -50);
  }

  function draw() {
    ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff41';
    ctx.font = MATRIX_FONT_SIZE + 'px JetBrains Mono, monospace';

    for (let i = 0; i < drops.length; i++) {
      const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
      ctx.fillText(char, i * MATRIX_FONT_SIZE, drops[i] * MATRIX_FONT_SIZE);
      if (drops[i] * MATRIX_FONT_SIZE > canvas.height && Math.random() > 0.98) {
        drops[i] = 0;
      }
      drops[i]++;
    }
    matrixAnimationId = requestAnimationFrame(draw);
  }

  resize();
  matrixDrawFn = draw;
  matrixAnimationId = requestAnimationFrame(draw);

  window.removeEventListener('resize', resize);
  window.addEventListener('resize', resize);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (matrixAnimationId) {
      cancelAnimationFrame(matrixAnimationId);
      matrixAnimationId = null;
    }
  } else if (!matrixAnimationId && matrixDrawFn && !reducedMotionQuery.matches) {
    matrixAnimationId = requestAnimationFrame(matrixDrawFn);
  }
});

initMatrixRain();

// ===== JST CLOCK =====
let jstClockInterval = null;

function initJSTClock() {
  // Clear any existing interval
  if (jstClockInterval) {
    clearInterval(jstClockInterval);
  }

  function updateJSTTime() {
    const timeEl = document.getElementById('jst-time');
    if (timeEl) {
      const now = new Date();
      const jst = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Tokyo',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      timeEl.textContent = jst + ' JST';
    }
  }

  updateJSTTime();
  jstClockInterval = setInterval(updateJSTTime, 1000);
}

// Initialize on first load
initJSTClock();

// ===== VIEW TRANSITIONS SUPPORT =====

/**
 * Skip fadeUp animations after View Transitions
 * This prevents the page-load animations from replaying after navigation
 */
function skipFadeUpAnimations() {
  const animatedElements = document.querySelectorAll(
    '.hero, .nav-hub, .featured, .footer, .page-header, ' +
    '.profile-section, .stats-section, .stack-section, .oss-section, ' +
    '.coming-soon, .article-header, .article-content, .blog-list'
  );

  animatedElements.forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.style.animation = 'none';
  });
}

/**
 * Astro View Transitions: after-swap event
 * Fired immediately after the new document replaces the old one
 */
document.addEventListener('astro:after-swap', () => {
  // Skip fadeUp animations on navigated pages
  skipFadeUpAnimations();

  // Re-initialize Matrix Rain (canvas may have been replaced)
  initMatrixRain();

  // Re-initialize JST Clock
  initJSTClock();
});

/**
 * Astro View Transitions: page-load event
 * Fired when the page is fully loaded (similar to DOMContentLoaded)
 */
document.addEventListener('astro:page-load', () => {
  // Ensure Matrix Rain is running
  if (!matrixAnimationId) {
    initMatrixRain();
  }

  // Ensure JST Clock is running
  if (!jstClockInterval) {
    initJSTClock();
  }
});
