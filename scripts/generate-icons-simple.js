const fs = require('fs');
const path = require('path');

const ICON_SIZES = [16, 32, 48, 128];
const INPUT_SVG = path.join(__dirname, '../src/public/icons/icon.svg');
const OUTPUT_DIR = path.join(__dirname, '../src/public/icons');

const svgContent = fs.readFileSync(INPUT_SVG, 'utf8');

console.log('📝 请按以下步骤生成 PNG 图标：\n');
console.log('1. 打开项目根目录下的 icon-generator.html');
console.log('2. 点击对应尺寸的"下载"按钮');
console.log('3. 将下载的文件保存到 src/public/icons/ 目录');
console.log('4. 确保文件名分别为：icon16.png, icon32.png, icon48.png, icon128.png');
console.log('\n或者使用在线工具转换：');
console.log('https://cloudconvert.com/svg-to-png');
console.log('\n生成的 SVG 内容预览：');
console.log('='.repeat(60));
console.log(svgContent.substring(0, 300) + '...');
console.log('='.repeat(60));

// 生成临时 HTML 文件方便访问
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>图适配图标生成器</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { color: #7c3aed; }
    .icons { display: flex; gap: 30px; flex-wrap: wrap; margin: 30px 0; }
    .icon-item { text-align: center; }
    button { background: #7c3aed; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-top: 10px; }
    button:hover { background: #6d28d9; }
    .instructions { background: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 30px; }
  </style>
</head>
<body>
  <h1>🎨 图适配 (PicFit) 图标生成器</h1>
  
  <div class="icons" id="icons"></div>
  
  <div class="instructions">
    <h3>📝 使用说明</h3>
    <ol>
      <li>点击下方按钮下载对应尺寸的 PNG 图标</li>
      <li>将下载的图标保存到 <code>src/public/icons/</code> 目录</li>
      <li>确保文件名分别为：<code>icon16.png</code>, <code>icon32.png</code>, <code>icon48.png</code>, <code>icon128.png</code></li>
    </ol>
  </div>

  <script>
    const sizes = [16, 32, 48, 128];
    
    function createIconSVG(size) {
      return \`${svgContent.replace(/width="128"/, 'width="' + size + '"').replace(/height="128"/, 'height="' + size + '"')}\`;
    }
    
    function downloadPNG(size) {
      const svg = createIconSVG(size);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      const img = new Image();
      img.onload = function() {
        ctx.drawImage(img, 0, 0, size, size);
        const link = document.createElement('a');
        link.download = 'icon' + size + '.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    }
    
    const container = document.getElementById('icons');
    
    sizes.forEach(size => {
      const div = document.createElement('div');
      div.className = 'icon-item';
      div.innerHTML = createIconSVG(size) + '<br><button onclick="downloadPNG(' + size + ')">下载 ' + size + 'x' + size + '</button>';
      container.appendChild(div);
    });
  </script>
</body>
</html>
`;

const tempHtmlPath = path.join(__dirname, '../icon-generator-simple.html');
fs.writeFileSync(tempHtmlPath, htmlContent);
console.log(`\n✅ 已生成临时文件: icon-generator-simple.html`);
console.log('请在浏览器中打开该文件下载图标！\n');
