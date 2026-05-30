const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const pdfPath = path.join(__dirname, 'test.pdf');
const outPath = path.join(__dirname, 'test-thumb.jpg');

const minimalPdf = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF'
);

async function test() {
  fs.writeFileSync(pdfPath, minimalPdf);
  try {
    const info = await sharp(pdfPath, { page: 0 }).metadata();
    console.log('sharp PDF metadata:', info);
    await sharp(pdfPath, { page: 0 }).resize(400).jpeg({ quality: 80 }).toFile(outPath);
    console.log('Thumbnail created:', outPath);
  } catch (e) {
    console.log('sharp PDF error:', e.message);
  }
}

test();
