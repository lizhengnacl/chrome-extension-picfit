const fs = require('fs');
const path = require('path');

const ICON_SIZES = [16, 32, 48, 128];
const INPUT_SVG = path.join(__dirname, '../src/public/icons/icon.svg');
const OUTPUT_DIR = path.join(__dirname, '../src/public/icons');

function createSimplePNG(size) {
  const svgContent = fs.readFileSync(INPUT_SVG, 'utf8');
  
  const canvasSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c3aed;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#a78bfa;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="24" fill="url(#grad)"/>
  <g transform="translate(24, 24)">
    <rect x="4" y="4" width="72" height="72" rx="8" fill="white" opacity="0.9"/>
    <rect x="16" y="16" width="48" height="48" rx="4" fill="none" stroke="#7c3aed" stroke-width="3"/>
    <line x1="16" y1="32" x2="64" y2="32" stroke="#7c3aed" stroke-width="2" stroke-dasharray="4,2"/>
    <line x1="40" y1="16" x2="40" y2="64" stroke="#7c3aed" stroke-width="2" stroke-dasharray="4,2"/>
    <circle cx="16" cy="16" r="4" fill="#7c3aed"/>
    <circle cx="64" cy="16" r="4" fill="#7c3aed"/>
    <circle cx="16" cy="64" r="4" fill="#7c3aed"/>
    <circle cx="64" cy="64" r="4" fill="#7c3aed"/>
  </g>
</svg>
  `;

  const outputPath = path.join(OUTPUT_DIR, `icon${size}.png`);
  
  const base64Header = 'data:image/svg+xml;base64,';
  const base64Svg = Buffer.from(canvasSvg).toString('base64');
  
  console.log(`SVG for ${size}x${size} created`);
  
  const placeholderNote = `
<!-- 
  注意：这个文件是占位符。
  请在浏览器中打开 http://localhost:3000/ 或使用以下命令生成真实的 PNG 图标：
  1. 运行 pnpm dev
  2. 在浏览器中打开 http://localhost:3000/
  3. 使用浏览器的开发者工具或截图工具将 SVG 保存为 PNG
  或者使用在线工具：https://cloudconvert.com/svg-to-png
-->
  `;
  
  fs.writeFileSync(outputPath.replace('.png', '.svg.tmp'), canvasSvg);
  console.log(`Temporary SVG saved to icon${size}.svg.tmp`);
  
  return outputPath;
}

console.log('生成图标文件...');
ICON_SIZES.forEach(size => {
  createSimplePNG(size);
});

console.log('\n✅ 临时 SVG 文件已生成！');
console.log('\n📝 下一步：');
console.log('1. 使用在线工具转换 SVG 到 PNG: https://cloudconvert.com/svg-to-png');
console.log('2. 或将 SVG 拖入 Figma/Sketch 等设计工具导出为 PNG');
console.log('3. 保存为 icon16.png, icon32.png, icon48.png, icon128.png');
console.log('4. 放入 src/public/icons/ 目录');
