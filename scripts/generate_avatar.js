const fs = require('fs');
const zlib = require('zlib');

function crc32(buf) {
  let table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.concat([t, data]);
  const crcVal = Buffer.alloc(4);
  crcVal.writeUInt32BE(crc32(crcBuf), 0);
  return Buffer.concat([len, t, data, crcVal]);
}

const W = 128;
const H = 128;

// IHDR
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 6; // RGBA
ihdr[10] = 0; // compression
ihdr[11] = 0; // filter
ihdr[12] = 0; // interlace

// Raw scanlines
const scanlines = Buffer.alloc(H * (W * 4 + 1));
let offset = 0;
const cx = 64;
const cy = 64;
const r = 60;

for (let y = 0; y < H; y++) {
  scanlines[offset++] = 0; // filter type None
  for (let x = 0; x < W; x++) {
    const dx = x - cx;
    const dy = y - cy;
    const distSq = dx * dx + dy * dy;

    // Check if inside circle
    if (distSq <= r * r) {
      // Check head circle: center (64, 46), radius 18
      const headDistSq = (x - 64) * (x - 64) + (y - 46) * (y - 46);
      // Check shoulders/body: ellipse at (64, 98), rx=32, ry=24
      const bodyDist = ((x - 64) * (x - 64)) / (32 * 32) + ((y - 96) * (y - 96)) / (26 * 26);

      if (headDistSq <= 18 * 18 || (bodyDist <= 1 && y >= 64)) {
        // White silhouette
        scanlines[offset++] = 255;
        scanlines[offset++] = 255;
        scanlines[offset++] = 255;
        scanlines[offset++] = 255;
      } else {
        // Emerald background: #059669
        scanlines[offset++] = 5;
        scanlines[offset++] = 150;
        scanlines[offset++] = 105;
        scanlines[offset++] = 255;
      }
    } else {
      // Transparent
      scanlines[offset++] = 0;
      scanlines[offset++] = 0;
      scanlines[offset++] = 0;
      scanlines[offset++] = 0;
    }
  }
}

const compressed = zlib.deflateSync(scanlines);
const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
const ihdrChunk = makeChunk('IHDR', ihdr);
const idatChunk = makeChunk('IDAT', compressed);
const iendChunk = makeChunk('IEND', Buffer.alloc(0));

const finalPng = Buffer.concat([pngHeader, ihdrChunk, idatChunk, iendChunk]);
fs.writeFileSync('public/images/avatar-placeholder.png', finalPng);
console.log('Successfully generated public/images/avatar-placeholder.png, size:', finalPng.length, 'bytes');
