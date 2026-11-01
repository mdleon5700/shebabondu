const fs = require('fs');
const zlib = require('zlib');

// Create a 32x32 PNG
function createPng(width, height) {
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  const cx = width / 2;
  const cy = height / 2;
  const r = (width / 2) - 1;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= r) {
        // Emerald background: #059669
        let r_col = 0x05, g_col = 0x96, b_col = 0x69, a_col = 0xFF;
        
        // Inner white checkmark/briefcase motif in center
        if (Math.abs(dx) <= 6 && Math.abs(dy) <= 6) {
          // White briefcase icon motif
          if (dy >= -2 && dy <= 5 && Math.abs(dx) <= 5) {
            r_col = 0xFF; g_col = 0xFF; b_col = 0xFF;
          } else if (dy >= -5 && dy < -2 && Math.abs(dx) <= 3 && !(dy === -4 && Math.abs(dx) === 1)) {
            r_col = 0xFF; g_col = 0xFF; b_col = 0xFF;
          }
        }

        rawData[offset++] = r_col;
        rawData[offset++] = g_col;
        rawData[offset++] = b_col;
        rawData[offset++] = a_col;
      } else {
        // Transparent
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const body = Buffer.concat([typeBuf, data]);
    const crc = crc32(body);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeInt32BE(crc, 0);
    return Buffer.concat([len, body, crcBuf]);
  }

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let j = 0; j < 8; j++) {
        c = (c >>> 1) ^ ((c & 1) ? 0xedb88320 : 0);
      }
    }
    return (c ^ 0xffffffff) | 0;
  }

  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

const png32 = createPng(32, 32);

// Pack into standard ICO format
// Header (6 bytes): 0x0000 (reserved), 0x0001 (ico), 0x0001 (1 image)
const icoHeader = Buffer.from([0, 0, 1, 0, 1, 0]);

// Directory Entry (16 bytes):
// [0] width (32)
// [1] height (32)
// [2] color count (0)
// [3] reserved (0)
// [4..5] color planes (1, 0)
// [6..7] bpp (32, 0)
// [8..11] size in bytes (uint32 LE)
// [12..15] offset in bytes (uint32 LE, 6 + 16 = 22)
const icoDir = Buffer.alloc(16);
icoDir[0] = 32;
icoDir[1] = 32;
icoDir[2] = 0;
icoDir[3] = 0;
icoDir.writeUInt16LE(1, 4);
icoDir.writeUInt16LE(32, 6);
icoDir.writeUInt32LE(png32.length, 8);
icoDir.writeUInt32LE(22, 12);

const icoBuffer = Buffer.concat([icoHeader, icoDir, png32]);
fs.writeFileSync('public/favicon.ico', icoBuffer);
fs.writeFileSync('src/app/favicon.ico', icoBuffer);
console.log('public/favicon.ico and src/app/favicon.ico created successfully, size:', icoBuffer.length);
