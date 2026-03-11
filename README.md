# 图适配 (PicFit)

> 智能图片裁剪工具，快速满足各平台图片上传要求

[![GitHub license](https://img.shields.io/github/license/your-username/picfit)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/your-username/picfit)](https://github.com/your-username/picfit/stargazers)

## 🎯 功能特性

- **智能裁剪**：可视化裁剪界面，支持比例锁定
- **平台预设**：内置多种常用平台尺寸预设
- **格式转换**：支持 JPG、PNG、WebP 格式转换
- **质量调节**：灵活控制图片质量与文件大小
- **本地处理**：所有操作完全在本地浏览器中完成，保护隐私安全

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

### 预览构建结果

```bash
pnpm preview
```

## 📦 安装到 Chrome

1. 运行 `pnpm build` 构建项目
2. 打开 Chrome 浏览器，访问 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目中的 `dist/` 目录

## 🛠️ 技术栈

- **框架**：React 18 + TypeScript
- **UI 组件**：NextUI + Tailwind CSS
- **构建工具**：Rsbuild
- **图片处理**：Canvas API

## 📁 项目结构

```
chrome-extension-picfit/
├── src/
│   ├── public/
│   │   └── manifest.json          # 扩展配置文件
│   ├── src/
│   │   ├── components/            # React 组件
│   │   │   ├── CropEditor.tsx
│   │   │   ├── FormatSettings.tsx
│   │   │   ├── PresetSelector.tsx
│   │   │   └── UploadZone.tsx
│   │   ├── lib/
│   │   │   └── imageProcessor.ts  # 图片处理核心逻辑
│   │   ├── App.tsx                 # 主应用组件
│   │   └── global.css              # 全局样式
│   ├── entry.tsx
│   └── entry.css
├── package.json
├── rsbuild.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## 🔒 隐私政策

PicFit 非常重视用户隐私：

- 不收集任何个人身份信息
- 所有图片处理操作均在用户本地浏览器中完成
- 图片数据不会上传到任何外部服务器
- 仅使用 Chrome Storage 保存用户偏好设置（本地存储）

完整的隐私政策请查看 [PRIVACY.md](./PRIVACY.md)

## 📜 许可证

本项目采用 [MIT 许可证](./LICENSE)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有任何问题，请通过GitHub Issues联系我们。
