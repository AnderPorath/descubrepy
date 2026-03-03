/**
 * Recorta el favicon en forma circular y sobrescribe app/icon.png y app/apple-icon.png
 * Ejecutar: node scripts/make-favicon-round.mjs
 */
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const src = path.join(root, 'app', 'icon.png');
const outApp = path.join(root, 'app', 'icon.png');
const outPublic = path.join(root, 'public', 'icon.png');
const outApple = path.join(root, 'app', 'apple-icon.png');
const outApplePublic = path.join(root, 'public', 'apple-icon.png');

const size = 512;
const radius = size / 2;

// Máscara circular: canal alpha 255 dentro del círculo, 0 fuera
const maskBuffer = Buffer.alloc(size * size * 4);
for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    const dx = x - radius + 0.5;
    const dy = y - radius + 0.5;
    const inside = dx * dx + dy * dy <= radius * radius;
    const i = (y * size + x) * 4;
    maskBuffer[i] = 255;
    maskBuffer[i + 1] = 255;
    maskBuffer[i + 2] = 255;
    maskBuffer[i + 3] = inside ? 255 : 0;
  }
}

async function run() {
  const img = await sharp(src)
    .resize(size, size)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = img;
  const channels = info.channels;
  const out = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const mi = i * 4;
    const alpha = maskBuffer[mi + 3];
    out[mi] = data[i * channels] ?? 0;
    out[mi + 1] = data[i * channels + 1] ?? 0;
    out[mi + 2] = data[i * channels + 2] ?? 0;
    out[mi + 3] = alpha;
  }

  const rounded = await sharp(out, {
    raw: { width: size, height: size, channels: 4 },
  })
    .png()
    .toBuffer();

  await sharp(rounded).toFile(outApp);
  await sharp(rounded).toFile(outPublic);
  await sharp(rounded).toFile(outApple);
  await sharp(rounded).toFile(outApplePublic);
  console.log('Favicon circular generado en app/icon.png, app/apple-icon.png y public/');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
