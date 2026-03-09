/**
 * 智能图片裁剪工具 - 主入口
 * Chrome浏览器插件弹窗界面
 */

import React, { useState, useCallback } from 'react';
import { UploadZone } from './components/UploadZone';
import { CropEditor } from './components/CropEditor';
import { PresetSelector } from './components/PresetSelector';
import { FormatSettings } from './components/FormatSettings';
import { loadImage, processImage, downloadBlob, type CropOptions, type ImageFormat } from './lib/imageProcessor';
import './global.css';

// 配置Tailwind主题
if (typeof window !== 'undefined' && (window as any).tailwind) {
  (window as any).tailwind.config = {
    ...(window as any).tailwind.config,
    theme: {
      extend: {
        colors: {
          primary: '#7c3aed',
          'primary-hover': '#6d28d9',
          secondary: '#f3f4f6',
          accent: '#a78bfa',
          background: '#ffffff',
          foreground: '#111827',
          border: '#e5e7eb',
          muted: '#f3f4f6',
          'muted-foreground': '#6b7280',
        }
      }
    }
  };
}

export default function App() {
  // 图片状态
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  
  // 裁剪状态
  const [crop, setCrop] = useState<CropOptions>({ x: 0, y: 0, width: 0, height: 0 });
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  
  // 自定义尺寸
  const [customWidth, setCustomWidth] = useState(0);
  const [customHeight, setCustomHeight] = useState(0);
  
  // 格式设置
  const [format, setFormat] = useState<ImageFormat>('image/jpeg');
  const [quality, setQuality] = useState(0.92);
  const [targetSizeKB, setTargetSizeKB] = useState<number | null>(null);
  
  // 处理状态
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'crop' | 'format'>('crop');
  const [showApplied, setShowApplied] = useState(false);
  const [appliedImage, setAppliedImage] = useState<HTMLImageElement | null>(null);

  // 处理文件选择
  const handleFileSelect = useCallback(async (file: File) => {
    try {
      const img = await loadImage(file);
      setImage(img);
      setOriginalFile(file);
      
      // 初始化裁剪区域为全图
      setCrop({
        x: 0,
        y: 0,
        width: img.naturalWidth,
        height: img.naturalHeight
      });
      
      setAspectRatio(null);
      setCustomWidth(img.naturalWidth);
      setCustomHeight(img.naturalHeight);
    } catch (error) {
      console.error('加载图片失败:', error);
      alert('图片加载失败，请重试');
    }
  }, []);

  // 应用裁剪预览
  const handleApplyCrop = useCallback(async () => {
    if (!image) return;
    
    setIsProcessing(true);
    
    try {
      const options = {
        crop,
        format: 'image/png',
        quality: 1.0
      };
      
      const blob = await processImage(image, options);
      const img = new Image();
      img.onload = () => {
        setAppliedImage(img);
        setShowApplied(true);
      };
      img.src = URL.createObjectURL(blob);
    } catch (error) {
      console.error('应用裁剪失败:', error);
      alert('应用裁剪失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  }, [image, crop]);

  // 重置所有设置
  const handleReset = useCallback(() => {
    if (!image) return;
    setCrop({
      x: 0,
      y: 0,
      width: image.naturalWidth,
      height: image.naturalHeight
    });
    setQuality(0.92);
    setTargetSizeKB(null);
    setShowApplied(false);
    setAppliedImage(null);
  }, [image]);

  // 处理下载
  const handleDownload = useCallback(async () => {
    if (!image || !originalFile) return;
    
    setIsProcessing(true);
    
    try {
      const options = {
        crop,
        format,
        quality,
        targetSizeKB: targetSizeKB || undefined
      };
      
      const blob = await processImage(image, options);
      const extension = format.split('/')[1];
      const filename = originalFile.name.replace(/\.[^/.]+$/, '') + `_cropped.${extension}`;
      
      downloadBlob(blob, filename);
    } catch (error) {
      console.error('处理图片失败:', error);
      alert('图片处理失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  }, [image, originalFile, crop, format, quality, targetSizeKB]);

  // 获取原图大小(KB)
  const originalSizeKB = originalFile ? originalFile.size / 1024 : 0;

  if (!image) {
    return (
      <div className="w-[520px] h-full bg-white dark:bg-gray-900 flex flex-col extension-popup">
        {/* 头部 */}
        <header className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="3" fill="white" opacity="0.9"/>
                <rect x="6" y="6" width="12" height="12" rx="2" fill="none" stroke="#7c3aed" strokeWidth="1.5"/>
                <line x1="6" y1="12" x2="18" y2="12" stroke="#7c3aed" strokeWidth="1" strokeDasharray="2,1"/>
                <line x1="12" y1="6" x2="12" y2="18" stroke="#7c3aed" strokeWidth="1" strokeDasharray="2,1"/>
                <circle cx="6" cy="6" r="1.5" fill="#7c3aed"/>
                <circle cx="18" cy="6" r="1.5" fill="#7c3aed"/>
                <circle cx="6" cy="18" r="1.5" fill="#7c3aed"/>
                <circle cx="18" cy="18" r="1.5" fill="#7c3aed"/>
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">图适配 PicFit</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">快速满足各平台图片要求</p>
            </div>
          </div>
        </header>

        {/* 上传区域 */}
        <main className="flex-1 p-6 flex flex-col justify-center">
          <UploadZone onFileSelect={handleFileSelect} />
          
          {/* 功能简介 */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="3" fill="white" opacity="0.9"/>
                  <rect x="6" y="6" width="12" height="12" rx="2" fill="none" stroke="white" strokeWidth="1.5"/>
                  <line x1="6" y1="12" x2="18" y2="12" stroke="white" strokeWidth="1" strokeDasharray="2,1"/>
                  <line x1="12" y1="6" x2="12" y2="18" stroke="white" strokeWidth="1" strokeDasharray="2,1"/>
                </svg>
              </div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">尺寸裁剪</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="3" fill="white" opacity="0.9"/>
                  <rect x="7" y="7" width="10" height="10" rx="2" fill="none" stroke="white" strokeWidth="1.5"/>
                  <rect x="9" y="9" width="6" height="6" rx="1" fill="none" stroke="white" strokeWidth="1"/>
                </svg>
              </div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">压缩/放大</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="3" fill="white" opacity="0.9"/>
                  <rect x="6" y="6" width="12" height="12" rx="2" fill="none" stroke="white" strokeWidth="1.5"/>
                  <line x1="8" y1="10" x2="16" y2="10" stroke="white" strokeWidth="1.5"/>
                  <line x1="8" y1="14" x2="16" y2="14" stroke="white" strokeWidth="1.5"/>
                </svg>
              </div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">格式转换</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="w-[640px] h-full bg-white dark:bg-gray-900 flex flex-col extension-popup">
      {/* 头部 */}
      <header className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="3" fill="white" opacity="0.9"/>
              <rect x="6" y="6" width="12" height="12" rx="2" fill="none" stroke="#7c3aed" strokeWidth="1.5"/>
              <line x1="6" y1="12" x2="18" y2="12" stroke="#7c3aed" strokeWidth="1" strokeDasharray="2,1"/>
              <line x1="12" y1="6" x2="12" y2="18" stroke="#7c3aed" strokeWidth="1" strokeDasharray="2,1"/>
              <circle cx="6" cy="6" r="1.5" fill="#7c3aed"/>
              <circle cx="18" cy="6" r="1.5" fill="#7c3aed"/>
              <circle cx="6" cy="18" r="1.5" fill="#7c3aed"/>
              <circle cx="18" cy="18" r="1.5" fill="#7c3aed"/>
            </svg>
          </div>
          <h1 className="text-base font-bold text-gray-900 dark:text-white">图适配 PicFit</h1>
        </div>
        <button
          onClick={() => {
            setImage(null);
            setOriginalFile(null);
          }}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          重新上传
        </button>
      </header>

      {/* 标签页 */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('crop')}
          className={`
            flex-1 py-2.5 text-sm font-medium transition-colors
            ${activeTab === 'crop'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }
          `}
        >
          裁剪编辑
        </button>
        <button
          onClick={() => setActiveTab('format')}
          className={`
            flex-1 py-2.5 text-sm font-medium transition-colors
            ${activeTab === 'format'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }
          `}
        >
          格式设置
        </button>
      </div>

      {/* 主内容区 */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'crop' ? (
          <div className="p-4 space-y-4">
            {showApplied && appliedImage ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">裁剪预览</h3>
                  <button
                    onClick={() => {
                      setShowApplied(false);
                      setAppliedImage(null);
                    }}
                    className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400"
                  >
                    返回编辑
                  </button>
                </div>
                <div className="flex justify-center bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
                  <img
                    src={appliedImage.src}
                    alt="裁剪预览"
                    className="max-w-full max-h-96 object-contain"
                  />
                </div>
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  预览尺寸: {appliedImage.naturalWidth} × {appliedImage.naturalHeight} px
                </div>
              </div>
            ) : (
              <>
                {/* 应用裁剪按钮 */}
                <div className="flex justify-end">
                  <button
                    onClick={handleApplyCrop}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-purple-400 transition-colors"
                  >
                    {isProcessing ? '处理中...' : '应用裁剪'}
                  </button>
                </div>
                
                {/* 裁剪编辑器 */}
                <CropEditor
                  image={image}
                  crop={crop}
                  onCropChange={setCrop}
                  aspectRatio={aspectRatio}
                  onAspectRatioChange={setAspectRatio}
                  showGrid={showGrid}
                  onShowGridChange={setShowGrid}
                />
                
                {/* 预设选择器 */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">选择预设尺寸</h3>
                  <PresetSelector
                    imageWidth={image.naturalWidth}
                    imageHeight={image.naturalHeight}
                    onSelect={(newCrop, ratio) => {
                      setCrop(newCrop);
                      setAspectRatio(ratio);
                    }}
                    customWidth={customWidth}
                    customHeight={customHeight}
                    onCustomWidthChange={setCustomWidth}
                    onCustomHeightChange={setCustomHeight}
                  />
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="p-4">
            <FormatSettings
              format={format}
              onFormatChange={setFormat}
              quality={quality}
              onQualityChange={setQuality}
              targetSizeKB={targetSizeKB}
              onTargetSizeChange={setTargetSizeKB}
              originalSizeKB={originalSizeKB}
              onDownload={handleDownload}
              isProcessing={isProcessing}
            />
          </div>
        )}
      </main>

      {/* 底部操作栏 */}
      <footer className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {image && (
            <span>
              原图: {image.naturalWidth} × {image.naturalHeight} px
              {crop && ` | 裁剪: ${Math.round(crop.width)} × ${Math.round(crop.height)} px`}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            重置
          </button>
          <button
            onClick={handleDownload}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-purple-400 transition-colors"
          >
            {isProcessing ? '处理中...' : '下载图片'}
          </button>
        </div>
      </footer>
    </div>
  );
}
