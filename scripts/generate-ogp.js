const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

// Register fonts
const fontDir = '/Users/wadakatu/.claude/plugins/cache/anthropic-agent-skills/example-skills/69c0b1a06741/skills/canvas-design/canvas-fonts';

try {
  registerFont(path.join(fontDir, 'JetBrainsMono-Bold.ttf'), { family: 'JetBrains Mono', weight: 'bold' });
  registerFont(path.join(fontDir, 'JetBrainsMono-Regular.ttf'), { family: 'JetBrains Mono', weight: 'normal' });
  registerFont(path.join(fontDir, 'Outfit-Bold.ttf'), { family: 'Outfit', weight: 'bold' });
  registerFont(path.join(fontDir, 'Outfit-Regular.ttf'), { family: 'Outfit', weight: 'normal' });
} catch (e) {
  console.log('Font registration note:', e.message);
}

// Canvas dimensions for OGP
const WIDTH = 1200;
const HEIGHT = 630;

// Color palette
const BG_COLOR = '#0a0a0a';
const MATRIX_GREEN = '#00ff41';
const MATRIX_DIM = '#00aa2a';
const MATRIX_DARK = '#004010';
const TEXT_GRAY = '#e0e0e0';
const TEXT_DIM = '#888888';

// Create canvas
const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext('2d');

// Fill background
ctx.fillStyle = BG_COLOR;
ctx.fillRect(0, 0, WIDTH, HEIGHT);

// Matrix rain characters
const matrixChars = 'アイウエオカキクケコサシスセソタチツテト01';

// Seeded random for consistency
let seed = 42;
const seededRandom = () => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};

// Draw subtle matrix rain in background
ctx.font = '14px "JetBrains Mono"';
for (let x = 0; x < WIDTH; x += 20) {
  const colLength = Math.floor(seededRandom() * 10) + 3;
  const startY = Math.floor(seededRandom() * 300) - 200;

  for (let i = 0; i < colLength; i++) {
    const y = startY + i * 18;
    if (y >= 0 && y < HEIGHT) {
      const char = matrixChars[Math.floor(seededRandom() * matrixChars.length)];
      const intensity = Math.floor((1 - i / colLength) * 25);
      ctx.fillStyle = `rgb(0, ${intensity}, ${Math.floor(intensity * 0.4)})`;
      ctx.fillText(char, x, y);
    }
  }
}

// Draw scanlines (CRT effect)
ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
for (let y = 0; y < HEIGHT; y += 3) {
  ctx.fillRect(0, y, WIDTH, 1);
}

// Draw terminal prompt on the left
const terminalLines = [
  { text: '$ whoami', type: 'cmd' },
  { text: '> wadakatu', type: 'out' },
  { text: '$ cat role.txt', type: 'cmd' },
  { text: '> Backend Developer', type: 'out' },
  { text: '$ pwd', type: 'cmd' },
  { text: '> /osaka/japan', type: 'out' },
  { text: '$ _', type: 'cmd' }
];

const terminalX = 60;
let terminalY = 155;
const lineHeight = 32;

ctx.font = '14px "JetBrains Mono"';
terminalLines.forEach((line, i) => {
  const y = terminalY + i * lineHeight;
  if (line.type === 'cmd') {
    ctx.fillStyle = MATRIX_DIM;
    ctx.fillText('$', terminalX, y);
    ctx.fillStyle = TEXT_DIM;
    ctx.fillText(line.text.substring(2), terminalX + 16, y);
  } else {
    ctx.fillStyle = MATRIX_GREEN;
    ctx.fillText('>', terminalX, y);
    ctx.fillText(line.text.substring(2), terminalX + 16, y);
  }
});

// Draw decorative vertical line
const divLineX = 340;
ctx.strokeStyle = MATRIX_DARK;
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(divLineX, 100);
ctx.lineTo(divLineX, HEIGHT - 100);
ctx.stroke();

// Small decorative dots along the line
ctx.fillStyle = MATRIX_DARK;
for (let y = 120; y < HEIGHT - 100; y += 40) {
  ctx.beginPath();
  ctx.arc(divLineX, y, 3, 0, Math.PI * 2);
  ctx.fill();
}

// Main content positioning
const contentX = 420;
const contentY = HEIGHT / 2 - 40;

// Draw main name "wadakatu"
const nameText = 'wadakatu';
ctx.font = 'bold 72px "Outfit"';
ctx.fillStyle = TEXT_GRAY;
ctx.fillText(nameText, contentX, contentY);

// Measure name width
const nameMetrics = ctx.measureText(nameText);

// Draw glowing underscore
ctx.font = 'bold 72px "JetBrains Mono"';
ctx.fillStyle = MATRIX_GREEN;
ctx.shadowColor = MATRIX_GREEN;
ctx.shadowBlur = 25;
ctx.fillText('_', contentX + nameMetrics.width, contentY);
ctx.shadowBlur = 15;
ctx.fillText('_', contentX + nameMetrics.width, contentY);
ctx.shadowBlur = 0;
ctx.fillText('_', contentX + nameMetrics.width, contentY);

// Reset shadow
ctx.shadowBlur = 0;

// Draw role subtitle
ctx.font = '28px "Outfit"';
ctx.fillStyle = TEXT_DIM;
ctx.fillText('Backend Developer', contentX, contentY + 55);

// Draw company
ctx.font = '20px "JetBrains Mono"';
ctx.fillStyle = MATRIX_DIM;
ctx.fillText('@ Studio Inc.', contentX, contentY + 100);

// Draw location with pin indicator
ctx.font = '16px "JetBrains Mono"';
ctx.fillStyle = MATRIX_GREEN;
ctx.fillText('>', contentX, contentY + 135);
ctx.fillStyle = TEXT_DIM;
ctx.fillText('Osaka, Japan', contentX + 20, contentY + 135);

// Draw decorative corner brackets
ctx.strokeStyle = MATRIX_DARK;
ctx.lineWidth = 2;
const bracketLen = 30;

// Top-left corner
ctx.beginPath();
ctx.moveTo(40 + bracketLen, 40);
ctx.lineTo(40, 40);
ctx.lineTo(40, 40 + bracketLen);
ctx.stroke();

// Top-right corner
ctx.beginPath();
ctx.moveTo(WIDTH - 40 - bracketLen, 40);
ctx.lineTo(WIDTH - 40, 40);
ctx.lineTo(WIDTH - 40, 40 + bracketLen);
ctx.stroke();

// Bottom-left corner
ctx.beginPath();
ctx.moveTo(40 + bracketLen, HEIGHT - 40);
ctx.lineTo(40, HEIGHT - 40);
ctx.lineTo(40, HEIGHT - 40 - bracketLen);
ctx.stroke();

// Bottom-right corner
ctx.beginPath();
ctx.moveTo(WIDTH - 40 - bracketLen, HEIGHT - 40);
ctx.lineTo(WIDTH - 40, HEIGHT - 40);
ctx.lineTo(WIDTH - 40, HEIGHT - 40 - bracketLen);
ctx.stroke();

// Add status indicator in bottom right
ctx.font = '11px "JetBrains Mono"';
const statusText = 'v1.0 // UPLINK ACTIVE';
const statusMetrics = ctx.measureText(statusText);
ctx.fillStyle = MATRIX_DARK;
ctx.fillText(statusText, WIDTH - statusMetrics.width - 60, HEIGHT - 55);

// Small green dot for status
ctx.fillStyle = MATRIX_GREEN;
ctx.shadowColor = MATRIX_GREEN;
ctx.shadowBlur = 8;
ctx.beginPath();
ctx.arc(WIDTH - statusMetrics.width - 75, HEIGHT - 51, 4, 0, Math.PI * 2);
ctx.fill();
ctx.shadowBlur = 0;

// Save as PNG
const outputDir = path.join(__dirname, '..');
const pngPath = path.join(outputDir, 'ogp-new.png');
const pngBuffer = canvas.toBuffer('image/png');
fs.writeFileSync(pngPath, pngBuffer);
console.log('PNG saved:', pngPath);
console.log('PNG size:', (pngBuffer.length / 1024).toFixed(1), 'KB');
console.log('\nTo convert to WebP, run: cwebp -q 85 ogp-new.png -o ogp-new.webp');
