const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const GREEN = '#2E7D32';
const WHITE = '#FFFFFF';

function svgCheckmark(color, size) {
  const padding = Math.round(size * 0.25);
  const inner = size - padding * 2;
  const cx = size / 2;
  const cy = size / 2;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${cx}" cy="${cy}" r="${inner / 2}" fill="${color}" opacity="0.12"/>
    <path d="M${cx - inner * 0.28} ${cy} L${cx - inner * 0.08} ${cy + inner * 0.25} L${cx + inner * 0.32} ${cy - inner * 0.2}" stroke="${color}" stroke-width="${inner * 0.1}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`;
}

function svgShield(size) {
  const padding = Math.round(size * 0.15);
  const inner = size - padding * 2;
  const cx = size / 2;
  const top = padding;
  const bottom = size - padding;
  const mid = (top + bottom) / 2;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" rx="${size * 0.1}" fill="${GREEN}"/>
    <path d="M${cx} ${top} L${cx - inner * 0.38} ${top + inner * 0.15} L${cx - inner * 0.38} ${mid} Q${cx} ${bottom} ${cx} ${bottom} Q${cx} ${bottom} ${cx + inner * 0.38} ${mid} L${cx + inner * 0.38} ${top + inner * 0.15} Z" fill="${WHITE}" opacity="0.95"/>
    <path d="M${cx - inner * 0.15} ${mid} L${cx - inner * 0.03} ${mid + inner * 0.16} L${cx + inner * 0.17} ${mid - inner * 0.12}" stroke="${GREEN}" stroke-width="${inner * 0.06}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`;
}

async function generate() {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });

  // icon.png — green checkmark on white, 1024x1024
  await sharp(Buffer.from(svgCheckmark(GREEN, 1024)))
    .resize(1024, 1024).png().toFile(path.join(ASSETS_DIR, 'icon.png'));
  console.log(`✓ icon.png  1024x1024`);

  // adaptive-icon.png — white shield on green, 1024x1024
  await sharp(Buffer.from(svgShield(1024)))
    .resize(1024, 1024).png().toFile(path.join(ASSETS_DIR, 'adaptive-icon.png'));
  console.log(`✓ adaptive-icon.png  1024x1024`);

  // splash-icon.png — white checkmark, transparent bg, 1284x1284
  // (backgroundColor in app.json fills the green)
  await sharp(Buffer.from(svgCheckmark(WHITE, 1284)))
    .resize(1284, 1284).png().toFile(path.join(ASSETS_DIR, 'splash-icon.png'));
  console.log(`✓ splash-icon.png  1284x1284`);

  // favicon.png — green checkmark on white, 48x48
  await sharp(Buffer.from(svgCheckmark(GREEN, 48)))
    .resize(48, 48).png().toFile(path.join(ASSETS_DIR, 'favicon.png'));
  console.log(`✓ favicon.png  48x48`);

  for (const f of ['icon.png', 'adaptive-icon.png', 'splash-icon.png', 'favicon.png']) {
    const p = path.join(ASSETS_DIR, f);
    const stat = fs.statSync(p);
    console.log(`  ${(stat.size / 1024).toFixed(1)} KB`);
  }
}

generate().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
