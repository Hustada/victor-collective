const sharp = require('sharp');
const path = require('path');

const sizes = [16, 32, 64];
const inputImage = path.join(__dirname, '../public/assets/brand/victorcol4.jpg');
const outputDir = path.join(__dirname, '../public');

async function generateFavicons() {
  try {
    // Generate PNG favicons
    for (const size of sizes) {
      await sharp(inputImage)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(path.join(outputDir, `favicon-${size}x${size}.png`));
    }

    console.log('Favicons generated successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error);
  }
}

generateFavicons();
