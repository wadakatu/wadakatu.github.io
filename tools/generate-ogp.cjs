/**
 * Generates the social preview card, drawn in TOMBO.
 *
 *   node tools/generate-ogp.cjs
 *   cwebp -q 90 public/ogp.png -o public/ogp.webp && rm public/ogp.png
 *
 * The card is a drawing sheet: hotaru paper, a 24px grid, registration
 * brackets at the trim, the name measured by a dimension line, and one shu
 * tick at the 62% mark — the proportion the TOMBO wordmark itself uses.
 * Fonts are the three voices, instanced as static TTFs under public/fonts/.
 */
const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

const fontDir = path.join(__dirname, 'fonts');
registerFont(path.join(fontDir, 'InstrumentSans-Bold.ttf'), { family: 'Instrument Sans', weight: 'bold' });
registerFont(path.join(fontDir, 'MPLUS2-Regular.ttf'), { family: 'M PLUS 2', weight: 'normal' });
registerFont(path.join(fontDir, 'MPLUS2-Bold.ttf'), { family: 'M PLUS 2', weight: 'bold' });
registerFont(path.join(fontDir, 'MartianMono-Medium.ttf'), { family: 'Martian Mono', weight: 'normal' });

const WIDTH = 1200;
const HEIGHT = 630;

// hotaru side of the tombo tokens — the card is always the night drawing
const PAPER = '#131714';
const INK = '#E5EBE6';
const INK_SUB = '#9AA69F';
const INK_FAINT = '#808D86';
const HAIRLINE = 'rgba(229,235,230,.14)';
const GRID = 'rgba(229,235,230,.05)';
const GREEN = '#4FC2A2';
const SHU = '#E5654C';

const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext('2d');

ctx.fillStyle = PAPER;
ctx.fillRect(0, 0, WIDTH, HEIGHT);

// S-06 graph paper, 24px cell
ctx.strokeStyle = GRID;
ctx.lineWidth = 1;
for (let x = 0; x <= WIDTH; x += 24) {
  ctx.beginPath();
  ctx.moveTo(x + 0.5, 0);
  ctx.lineTo(x + 0.5, HEIGHT);
  ctx.stroke();
}
for (let y = 0; y <= HEIGHT; y += 24) {
  ctx.beginPath();
  ctx.moveTo(0, y + 0.5);
  ctx.lineTo(WIDTH, y + 0.5);
  ctx.stroke();
}

// S-01 registration brackets at the trim
const M = 48;
const ARM = 34;
ctx.strokeStyle = INK;
ctx.lineWidth = 2;
const bracket = (x, y, dx, dy) => {
  ctx.beginPath();
  ctx.moveTo(x + dx * ARM, y);
  ctx.lineTo(x, y);
  ctx.lineTo(x, y + dy * ARM);
  ctx.stroke();
};
bracket(M, M, 1, 1);
bracket(WIDTH - M, M, -1, 1);
bracket(M, HEIGHT - M, 1, -1);
bracket(WIDTH - M, HEIGHT - M, -1, -1);

const LEFT = 108;

// S-05 the kicker — shu takes the first stroke, the mono label follows
let y = 208;
ctx.strokeStyle = SHU;
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(LEFT, y - 7);
ctx.lineTo(LEFT + 34, y - 7);
ctx.stroke();

ctx.font = '19px "Martian Mono"';
ctx.fillStyle = GREEN;
ctx.fillText('WADAKATU.DEV', LEFT + 54, y);

// the name, in the display voice
y += 100;
ctx.font = 'bold 104px "Instrument Sans"';
ctx.fillStyle = INK;
ctx.fillText('wadakatu', LEFT, y);
const nameWidth = ctx.measureText('wadakatu').width;

// S-02 the name, measured
y += 44;
ctx.strokeStyle = INK_SUB;
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(LEFT, y - 8);
ctx.lineTo(LEFT, y + 8);
ctx.moveTo(LEFT + nameWidth, y - 8);
ctx.lineTo(LEFT + nameWidth, y + 8);
ctx.moveTo(LEFT, y);
ctx.lineTo(LEFT + nameWidth, y);
ctx.stroke();

// the one shu tick, at the wordmark's own 62%
ctx.strokeStyle = SHU;
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(LEFT + nameWidth * 0.62, y - 13);
ctx.lineTo(LEFT + nameWidth * 0.62, y + 13);
ctx.stroke();

y += 42;
ctx.font = '17px "Martian Mono"';
ctx.fillStyle = INK_FAINT;
ctx.fillText('handle: 1 line — measured / glyphs: 8', LEFT, y);

// the body voice carries the role
y += 64;
ctx.font = '31px "M PLUS 2"';
ctx.fillStyle = INK_SUB;
ctx.fillText('Backend Developer @ Studio Inc.', LEFT, y);

// footer rule + running numbers
const footY = HEIGHT - 112;
ctx.strokeStyle = HAIRLINE;
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(LEFT, footY + 0.5);
ctx.lineTo(WIDTH - LEFT, footY + 0.5);
ctx.stroke();

ctx.font = '17px "Martian Mono"';
ctx.fillStyle = INK_FAINT;
ctx.fillText('OSAKA, JAPAN', LEFT, footY + 38);

const right = 'SET IN TOMBO';
ctx.fillText(right, WIDTH - LEFT - ctx.measureText(right).width, footY + 38);

const out = path.join(__dirname, '..', 'public', 'ogp.png');
fs.writeFileSync(out, canvas.toBuffer('image/png'));
console.log('wrote', out);
