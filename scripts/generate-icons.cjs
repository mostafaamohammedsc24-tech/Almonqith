const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

// Helper to create a valid minimal RGBA PNG of given width and height
function createPng(width, height, r, g, b, a = 255) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(6, 9); // RGBA color type
  ihdrData.writeUInt8(0, 10); // compression method 0
  ihdrData.writeUInt8(0, 11); // filter method 0
  ihdrData.writeUInt8(0, 12); // interlace method 0

  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw image data with filter byte 0 per scanline
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);
  
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None
    
    // Draw an academic crest pattern
    const cy = y - height / 2;
    for (let x = 0; x < width; x++) {
      const cx = x - width / 2;
      const dist = Math.sqrt(cx * cx + cy * cy);
      const radius = width * 0.44;
      
      let pixelR = r;
      let pixelG = g;
      let pixelB = b;
      let pixelA = a;
      
      // Outer border / inner circle
      if (dist < radius) {
        // Gold academic highlight inside blue
        if (dist > radius - 12 && dist < radius - 4) {
          pixelR = 250; pixelG = 204; pixelB = 21; // #facc15 Gold
        } else if (dist < radius * 0.3) {
          pixelR = 255; pixelG = 255; pixelB = 255; // White center
        } else {
          pixelR = 29; pixelG = 78; pixelB = 216; // #1d4ed8 Blue
        }
      } else {
        // Corner background
        pixelR = 30; pixelG = 58; pixelB = 138; // #1e3a8a Dark blue
      }
      
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = pixelR;
      rawData[pxOffset + 1] = pixelG;
      rawData[pxOffset + 2] = pixelB;
      rawData[pxOffset + 3] = pixelA;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);

  const crc = crc32(body);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([len, body, crcBuf]);
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

const pubDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true });

fs.writeFileSync(path.join(pubDir, 'pwa-192x192.png'), createPng(192, 192, 29, 78, 216));
fs.writeFileSync(path.join(pubDir, 'pwa-512x512.png'), createPng(512, 512, 29, 78, 216));
fs.writeFileSync(path.join(pubDir, 'pwa-maskable-512x512.png'), createPng(512, 512, 30, 58, 138));
fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), createPng(180, 180, 29, 78, 216));

console.log('Successfully generated PWA PNG icons in public/');
