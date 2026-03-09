const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ICON_SIZES = [16, 32, 48, 128];
const INPUT_SVG = path.join(__dirname, '../src/public/icons/icon.svg');
const OUTPUT_DIR = path.join(__dirname, '../src/public/icons');

const svgContent = fs.readFileSync(INPUT_SVG, 'utf8');

function createIconSVG(size) {
  return svgContent
    .replace(/width="128"/, `width="${size}"`)
    .replace(/height="128"/, `height="${size}"`);
}

console.log('🎨 正在生成图标...\n');

try {
  for (const size of ICON_SIZES) {
    const svg = createIconSVG(size);
    const tempSvgPath = path.join(OUTPUT_DIR, `temp-${size}.svg`);
    fs.writeFileSync(tempSvgPath, svg);
    
    const outputPath = path.join(OUTPUT_DIR, `icon${size}.png`);
    
    try {
      execSync(`which convert`);
      console.log(`📐 使用 ImageMagick 生成 ${size}x${size}...`);
      execSync(`convert -background none ${tempSvgPath} ${outputPath}`);
    } catch (e) {
      console.log(`⚠️  ImageMagick 不可用，请使用以下方法之一：`);
      console.log(`   1. 打开 dist/icon-generator.html 手动下载`);
      console.log(`   2. 或安装 ImageMagick: brew install imagemagick`);
      process.exit(1);
    }
    
    fs.unlinkSync(tempSvgPath);
    console.log(`✅ icon${size}.png 已生成`);
  }
  
  console.log('\n🎉 所有图标生成完成！');
  console.log('现在可以运行 pnpm build 重新构建了');
  
} catch (error) {
  console.error('\n❌ 生成失败:', error.message);
  console.log('\n💡 替代方案：');
  console.log('1. 在浏览器中打开 dist/icon-generator.html');
  console.log('2. 点击对应尺寸的下载按钮');
  console.log('3. 保存到 src/public/icons/ 目录');
  process.exit(1);
}
