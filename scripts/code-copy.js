// Code Copy Button functionality
(function() {
  // Initialize code copy buttons
  function initCodeCopyButtons() {
    const codeBlocks = document.querySelectorAll('.markdown-body pre');

    codeBlocks.forEach((pre) => {
      if (pre.querySelector('.code-copy-btn')) return;

      const button = document.createElement('button');
      button.className = 'code-copy-btn';
      button.setAttribute('aria-label', 'Copy code to clipboard');
      button.setAttribute('title', 'Copy code');
      button.innerHTML = `
        <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span class="btn-label">Copy</span>
      `;

      button.addEventListener('click', async () => {
        const code = pre.querySelector('code');
        if (!code) return;

        try {
          await navigator.clipboard.writeText(code.textContent);
          showCopySuccess(button);
        } catch (err) {
          const textArea = document.createElement('textarea');
          textArea.value = code.textContent;
          textArea.style.position = 'fixed';
          textArea.style.opacity = '0';
          document.body.appendChild(textArea);
          textArea.select();

          try {
            document.execCommand('copy');
            showCopySuccess(button);
          } catch (e) {
            button.querySelector('.btn-label').textContent = 'Failed';
            setTimeout(() => {
              button.querySelector('.btn-label').textContent = 'Copy';
            }, 2000);
          }

          document.body.removeChild(textArea);
        }
      });

      pre.appendChild(button);
    });
  }

  function showCopySuccess(button) {
    button.classList.add('copied');
    button.querySelector('.btn-label').textContent = 'Copied!';
    button.setAttribute('aria-label', 'Code copied to clipboard');

    setTimeout(() => {
      button.classList.remove('copied');
      button.querySelector('.btn-label').textContent = 'Copy';
      button.setAttribute('aria-label', 'Copy code to clipboard');
    }, 2000);
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCodeCopyButtons);
  } else {
    initCodeCopyButtons();
  }
})();
