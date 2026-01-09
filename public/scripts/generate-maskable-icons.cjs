const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// Output directory
const OUTPUT_DIR = path.join(__dirname, '..', 'images');

// Background color (must match the icon's background)
const BG_COLOR = '#0a0a0a';

// Maskable icons to generate from existing icons
const MASKABLE_ICONS = [
  { source: 'icon-192.png', output: 'icon-192-maskable.png', size: 192 },
  { source: 'icon-512.png', output: 'icon-512-maskable.png', size: 512 },
];

async function generateMaskableIcons() {
  console.log('Generating maskable icons...\n');

  for (const icon of MASKABLE_ICONS) {
    const sourcePath = path.join(OUTPUT_DIR, icon.source);

    try {
      const sourceImage = await loadImage(sourcePath);
      console.log(`Loaded source: ${icon.source} (${sourceImage.width}x${sourceImage.height})`);

      const canvas = createCanvas(icon.size, icon.size);
      const ctx = canvas.getContext('2d');

      // Fill background (ensures full canvas coverage for maskable safe zone)
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, icon.size, icon.size);

      // Scale content to 80% and center it (10% padding on each side for safe zone)
      const padding = icon.size * 0.1;
      const innerSize = icon.size * 0.8;

      ctx.drawImage(
        sourceImage,
        0, 0, sourceImage.width, sourceImage.height,  // Source rectangle (full image)
        padding, padding, innerSize, innerSize         // Destination (centered with padding)
      );

      // Save the maskable icon
      const outputPath = path.join(OUTPUT_DIR, icon.output);
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(outputPath, buffer);
      console.log(`Generated: ${icon.output} (${icon.size}x${icon.size}) - ${(buffer.length / 1024).toFixed(1)} KB\n`);
    } catch (e) {
      console.error(`Error processing ${icon.source}:`, e.message);
    }
  }

  console.log('Maskable icons generated successfully!');
  console.log('\nNote: Test your maskable icons at https://maskable.app/');
}

generateMaskableIcons().catch(console.error);
