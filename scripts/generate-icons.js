const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ICON_SIZES = [16, 32, 48, 128];
const SVG_PATH = path.join(__dirname, '../src/public/icons/icon.svg');
const OUTPUT_DIR = path.join(__dirname, '../src/public/icons');

async function generateIcons() {
  console.log('🔧 正在生成图标...');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  for (const size of ICON_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `icon${size}.png`);
    
    try {
      await sharp(SVG_PATH)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✅ 生成 icon${size}.png`);
    } catch (error) {
      console.error(`❌ 生成 icon${size}.png 失败:`, error);
      throw error;
    }
  }

  console.log('🎉 所有图标生成完成！');
}

generateIcons().catch(console.error);
