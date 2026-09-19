const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const svgPath = path.join(publicDir, 'favicon.svg');
const tmpDir = path.join(rootDir, '.temp_icon');

if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

console.log('Rendering 512x512 PNG from SVG...');
execSync(`qlmanage -t -s 512 -o "${tmpDir}" "${svgPath}"`, { stdio: 'inherit' });

const base512 = path.join(tmpDir, 'favicon.svg.png');
if (!fs.existsSync(base512)) {
  throw new Error('Failed to render 512x512 PNG from SVG');
}

// Ensure 512x512 is exact
const logo512 = path.join(publicDir, 'logo512.png');
fs.copyFileSync(base512, logo512);

// Sizes to generate
const sizes = [
  { size: 192, dest: path.join(publicDir, 'logo192.png') },
  { size: 180, dest: path.join(publicDir, 'apple-touch-icon.png') },
  { size: 48, dest: path.join(tmpDir, 'favicon-48.png') },
  { size: 32, dest: path.join(publicDir, 'favicon-32x32.png') },
  { size: 16, dest: path.join(publicDir, 'favicon-16x16.png') },
];

for (const { size, dest } of sizes) {
  execSync(`sips -z ${size} ${size} "${base512}" --out "${dest}"`, { stdio: 'inherit' });
  console.log(`Generated ${size}x${size} -> ${path.basename(dest)}`);
}

// Generate multi-resolution ICO file from 16x16, 32x32, 48x48 PNGs
const icoSizes = [
  { size: 16, path: path.join(publicDir, 'favicon-16x16.png') },
  { size: 32, path: path.join(publicDir, 'favicon-32x32.png') },
  { size: 48, path: path.join(tmpDir, 'favicon-48.png') },
];

function buildIco(images) {
  const count = images.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let currentOffset = headerSize + count * dirEntrySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type 1 = ICO
  header.writeUInt16LE(count, 4); // Image count

  const dirEntries = [];
  const imageBuffers = [];

  for (const img of images) {
    const data = fs.readFileSync(img.path);
    imageBuffers.push(data);

    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(img.size === 256 ? 0 : img.size, 0); // Width
    entry.writeUInt8(img.size === 256 ? 0 : img.size, 1); // Height
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(data.length, 8); // Size of image data
    entry.writeUInt32LE(currentOffset, 12); // Offset of image data

    dirEntries.push(entry);
    currentOffset += data.length;
  }

  return Buffer.concat([header, ...dirEntries, ...imageBuffers]);
}

const icoBuffer = buildIco(icoSizes);
const icoPath = path.join(publicDir, 'favicon.ico');
fs.writeFileSync(icoPath, icoBuffer);
console.log(`Generated valid ICO file (${icoBuffer.length} bytes) -> favicon.ico`);

// Clean up temp directory
fs.rmSync(tmpDir, { recursive: true, force: true });
console.log('Done generating all favicon assets!');
