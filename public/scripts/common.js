// ===== MATRIX RAIN EFFECT =====
let matrixRainInterval = null;

function initMatrixRain() {
  const canvas = document.getElementById('matrix-rain');
  if (!canvas) return;

  // Clear any existing interval
  if (matrixRainInterval) {
    clearInterval(matrixRainInterval);
  }

  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();

  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789';
  const charArray = chars.split('');
  const fontSize = 14;
  let columns = Math.floor(canvas.width / fontSize);
  let drops = Array(columns).fill(0).map(() => Math.random() * -50);

  function draw() {
    ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff41';
    ctx.font = fontSize + 'px JetBrains Mono, monospace';

    for (let i = 0; i < drops.length; i++) {
      const char = charArray[Math.floor(Math.random() * charArray.length)];
      ctx.fillText(char, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.98) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  matrixRainInterval = setInterval(draw, 60);

  // Handle resize
  window.removeEventListener('resize', resize);
  window.addEventListener('resize', resize);
}

// Initialize on first load
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
  if (!matrixRainInterval) {
    initMatrixRain();
  }

  // Ensure JST Clock is running
  if (!jstClockInterval) {
    initJSTClock();
  }
});
