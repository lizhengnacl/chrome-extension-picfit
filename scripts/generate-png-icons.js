const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const ICON_SIZES = [16, 32, 48, 128];
const INPUT_SVG = path.join(__dirname, '../src/public/icons/icon.svg');
const OUTPUT_DIR = path.join(__dirname, '../src/public/icons');

async function generatePNG(size) {
  const svgContent = fs.readFileSync(INPUT_SVG, 'utf8');
  
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  const img = await loadImage(Buffer.from(svgContent));
  ctx.drawImage(img, 0, 0, size, size);
  
  const buffer = canvas.toBuffer('image/png');
  const outputPath = path.join(OUTPUT_DIR, `icon${size}.png`);
  fs.writeFileSync(outputPath, buffer);
  
  console.log(`✅ Generated icon${size}.png`);
}

async function main() {
  console.log('🚀 Generating PNG icons...\n');
  
  try {
    for (const size of ICON_SIZES) {
      await generatePNG(size);
    }
    
    console.log('\n🎉 All icons generated successfully!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n💡 Tip: Please install canvas first:');
    console.log('   pnpm add -D canvas');
    process.exit(1);
  }
}

main();
