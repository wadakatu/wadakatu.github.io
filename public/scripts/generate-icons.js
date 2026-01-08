const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// Output directory
const OUTPUT_DIR = path.join(__dirname, '..', 'images');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log('Created directory:', OUTPUT_DIR);
}

// Icon sizes to generate
const ICON_SIZES = [
  { name: 'favicon-16.png', size: 16, format: 'png' },
  { name: 'favicon-32.png', size: 32, format: 'png' },
  { name: 'apple-touch-icon.png', size: 180, format: 'png' },
  { name: 'icon-192.png', size: 192, format: 'png' },
  { name: 'icon-512.png', size: 512, format: 'png' },
  { name: 'logo-48.png', size: 48, format: 'png' },
  { name: 'logo-80.png', size: 80, format: 'png' },
  { name: 'logo-144.png', size: 144, format: 'png' },
  { name: 'logo-400.png', size: 400, format: 'png' },
];

// Color palette
const BG_COLOR = '#0a0a0a';
const MATRIX_GREEN = '#00ff41';
const TEXT_GRAY = '#e0e0e0';

async function generateIcons() {
  // Load the original logo (PNG version)
  const originalPath = path.join(__dirname, '..', 'ogp-original.png');

  let sourceImage;
  try {
    sourceImage = await loadImage(originalPath);
    console.log('Loaded original image:', originalPath);
    console.log('Original size:', sourceImage.width, 'x', sourceImage.height);
  } catch (e) {
    console.log('Could not load original ogp.webp, generating icons from scratch');
    sourceImage = null;
  }

  for (const icon of ICON_SIZES) {
    const canvas = createCanvas(icon.size, icon.size);
    const ctx = canvas.getContext('2d');

    // Fill background
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, icon.size, icon.size);

    if (sourceImage) {
      // Calculate center crop from square source
      const srcSize = Math.min(sourceImage.width, sourceImage.height);
      const srcX = (sourceImage.width - srcSize) / 2;
      const srcY = (sourceImage.height - srcSize) / 2;

      // Draw scaled image
      ctx.drawImage(
        sourceImage,
        srcX, srcY, srcSize, srcSize,  // Source rectangle
        0, 0, icon.size, icon.size      // Destination rectangle
      );
    } else {
      // Generate a simple icon with "W" letter
      const fontSize = Math.floor(icon.size * 0.6);
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Draw glow
      ctx.shadowColor = MATRIX_GREEN;
      ctx.shadowBlur = icon.size * 0.1;
      ctx.fillStyle = MATRIX_GREEN;
      ctx.fillText('W', icon.size / 2, icon.size / 2);

      // Draw letter
      ctx.shadowBlur = 0;
      ctx.fillStyle = TEXT_GRAY;
      ctx.fillText('W', icon.size / 2, icon.size / 2);
    }

    // Save the icon
    const outputPath = path.join(OUTPUT_DIR, icon.name);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    console.log(`Generated: ${icon.name} (${icon.size}x${icon.size}) - ${(buffer.length / 1024).toFixed(1)} KB`);
  }

  // Generate favicon.ico (simple 32x32 PNG renamed, browsers accept this)
  const favicon32Path = path.join(OUTPUT_DIR, 'favicon-32.png');
  const faviconIcoPath = path.join(OUTPUT_DIR, 'favicon.ico');
  fs.copyFileSync(favicon32Path, faviconIcoPath);
  console.log('Generated: favicon.ico (copy of favicon-32.png)');

  console.log('\nAll icons generated successfully!');
  console.log('\nNext step: Convert logo PNGs to WebP:');
  console.log('  cwebp -q 90 images/logo-48.png -o images/logo-48.webp');
  console.log('  cwebp -q 90 images/logo-80.png -o images/logo-80.webp');
  console.log('  cwebp -q 90 images/logo-144.png -o images/logo-144.webp');
  console.log('  cwebp -q 90 images/logo-400.png -o images/logo-400.webp');
}

generateIcons().catch(console.error);
