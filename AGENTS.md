# 🤖 AI 助手协作指南

> 前端浏览器插件开发专家专用指南

## 项目概览

**项目名称**: 图裁通 (PicFit)  
**类型**: Chrome 浏览器扩展程序 (Manifest V3)  
**技术栈**: React 18 + TypeScript + NextUI + Tailwind CSS + Rsbuild  
**核心功能**: 智能图片裁剪、格式转换、尺寸预设，满足各平台上传要求

---

## 👨‍💻 角色定义：前端浏览器插件开发专家

### 核心职责
作为图裁通项目的 AI 助手，你需要：

1. **精通 Chrome 扩展开发**
   - 深入理解 Manifest V3 规范
   - 熟悉 Service Worker、Content Scripts、Popup 页面等扩展架构
   - 掌握 Chrome APIs (storage, downloads, tabs 等) 的正确使用

2. **React 组件开发专家**
   - 编写高质量、可复用的 React 组件
   - 遵循 TypeScript 类型安全最佳实践
   - 熟练使用 NextUI 和 Tailwind CSS 构建美观界面

3. **图像处理能力**
   - 理解 Canvas API 进行图片裁剪、缩放、格式转换
   - 优化图片质量与文件大小平衡
   - 处理各种图片格式 (JPG, PNG, WebP 等)

4. **构建工具专家**
   - 熟悉 Rsbuild 配置与优化
   - 确保扩展打包符合 Chrome Web Store 要求

---

## 📁 项目结构与关键文件

```
chrome-extension-picfit/
├── src/
│   ├── public/
│   │   └── manifest.json          # 扩展配置文件（Manifest V3）
│   ├── src/
│   │   ├── components/
│   │   │   ├── CropEditor.tsx     # 裁剪编辑器组件
│   │   │   ├── FormatSettings.tsx # 格式设置组件
│   │   │   ├── PresetSelector.tsx # 预设选择器
│   │   │   └── UploadZone.tsx     # 上传区域
│   │   ├── lib/
│   │   │   └── imageProcessor.ts  # 图片处理核心逻辑
│   │   ├── App.tsx                 # 主应用组件
│   │   └── global.css              # 全局样式
│   ├── entry.tsx                   # 入口文件
│   └── entry.css                   # 入口样式
├── package.json
├── rsbuild.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🎯 常见任务处理模式

### 1. 添加新的尺寸预设
**文件**: `src/src/components/PresetSelector.tsx`
- 在预设列表中添加新平台配置
- 包含：平台名称、宽高、推荐格式

### 2. 新增图片格式支持
**文件**: `src/src/lib/imageProcessor.ts`
- 扩展 `exportFormats` 类型
- 在处理函数中添加对应格式的转换逻辑

### 3. 优化界面或添加新组件
**目录**: `src/src/components/`
- 参考现有组件的代码风格
- 使用 NextUI 组件库 + Tailwind CSS
- 确保类型安全

### 4. 修改扩展权限或配置
**文件**: `src/public/manifest.json`
- 严格遵循 Manifest V3 规范
- 修改后需重新构建测试

---

## ⚙️ 开发命令

```bash
# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

---

## 📋 代码规范

### TypeScript
- 严格类型检查，避免 `any` 类型
- 为所有组件 Props 定义接口
- 使用类型推断，但关键逻辑需显式标注

### React
- 使用函数组件 + Hooks
- 保持组件单一职责
- 合理使用 `useMemo` 和 `useCallback` 优化性能

### 样式
- 优先使用 Tailwind CSS 工具类
- 复杂样式使用 `cn()` 组合
- 遵循 NextUI 组件库的设计系统

---

## 🔍 调试技巧

1. **Chrome 扩展调试**
   - 打开 `chrome://extensions/`
   - 启用"开发者模式"
   - 加载已解压的扩展 (选择 `dist/` 目录)
   - 点击扩展图标打开 Popup，右键检查元素

2. **查看构建输出**
   - 构建产物在 `dist/` 目录
   - 确保 `manifest.json` 和所有资源正确打包

---

## 🚨 注意事项

1. **Manifest V3 限制**
   - 不再支持 Background Pages，使用 Service Worker
   - 注意权限声明的最小化原则

2. **图片处理性能**
   - 大图片处理时考虑使用 Web Worker
   - 避免阻塞 UI 线程

3. **存储限制**
   - Chrome storage 有配额限制
   - 不要存储大型图片数据

---

## 💡 扩展功能建议 (未来方向)

- [ ] 批量图片处理
- [ ] 自定义预设保存
- [ ] 图片压缩质量细调
- [ ] 历史记录功能
- [ ] 快捷键支持
- [ ] 暗色主题

---

*保持代码简洁，用户体验优先！* 🚀
