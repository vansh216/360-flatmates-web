/**
 * Generate a multi-resolution favicon.ico (16, 32, 48) from public/favicon.svg.
 *
 * ICO format embeds PNG image data (not raw BMP), which browsers accept.
 * We hand-assemble the ICONDIR + ICONDIRENTRY headers and append PNG bytes
 * for each size — no extra image library required (sharp produces the PNGs).
 *
 * Run:  npx tsx scripts/generate-favicon-ico.ts
 *
 * Output: public/favicon.ico
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import sharp from "sharp";

const SIZES = [16, 32, 48] as const;

async function pngForSize(svg: Buffer, size: number): Promise<Buffer> {
  return sharp(svg, { density: 384 })
    .resize(size, size, { fit: "cover" })
    .png({ quality: 95, compressionLevel: 9 })
    .toBuffer();
}

function writeU16LE(buf: Buffer, value: number, offset: number): void {
  buf.writeUInt16LE(value & 0xffff, offset);
}
function writeU32LE(buf: Buffer, value: number, offset: number): void {
  buf.writeUInt32LE(value >>> 0, offset);
}

async function generateIco(): Promise<void> {
  const root = process.cwd();
  const svg = readFileSync(resolve(root, "public", "favicon.svg"));

  const images: { size: number; data: Buffer }[] = [];
  for (const size of SIZES) {
    images.push({ size, data: await pngForSize(svg, size) });
  }

  const headerSize = 6; // ICONDIR
  const entrySize = 16; // per ICONDIRENTRY
  const dirSize = headerSize + entrySize * images.length;
  const totalSize =
    dirSize + images.reduce((acc, img) => acc + img.data.length, 0);

  const ico = Buffer.alloc(totalSize);
  // ICONDIR
  writeU16LE(ico, 0, 0); // reserved
  writeU16LE(ico, 1, 2); // type: 1 = icon
  writeU16LE(ico, images.length, 4); // count

  let offset = dirSize;
  images.forEach((img, i) => {
    const entry = headerSize + i * entrySize;
    // width/height: 0 means 256
    ico.writeUInt8(img.size === 256 ? 0 : img.size, entry + 0);
    ico.writeUInt8(img.size === 256 ? 0 : img.size, entry + 1);
    ico.writeUInt8(0, entry + 2); // color palette (0 = no palette)
    ico.writeUInt8(0, entry + 3); // reserved
    writeU16LE(ico, 1, entry + 4); // color planes
    writeU16LE(ico, 32, entry + 6); // bits per pixel
    writeU32LE(ico, img.data.length, entry + 8); // byte size
    writeU32LE(ico, offset, entry + 12); // offset to image data
    offset += img.data.length;
  });

  // append image data
  let dataOffset = dirSize;
  for (const img of images) {
    img.data.copy(ico, dataOffset);
    dataOffset += img.data.length;
  }

  const out = resolve(root, "public", "favicon.ico");
  writeFileSync(out, ico);
  console.log(`Generated favicon.ico (${images.map((i) => i.size).join("/")})`);
}

generateIco().catch((err) => {
  console.error("Error generating favicon.ico:", err);
  process.exit(1);
});
