/**
 * 格式设置组件
 * 提供图片格式转换和质量调整功能
 */

import React from 'react';
import { FileImage, Download } from 'lucide-react';
import type { ImageFormat } from '../lib/imageProcessor';
import { getFileExtension } from '../lib/imageProcessor';

interface FormatSettingsProps {
  format: ImageFormat;
  onFormatChange: (format: ImageFormat) => void;
  quality: number;
  onQualityChange: (quality: number) => void;
  targetSizeKB: number | null;
  onTargetSizeChange: (size: number | null) => void;
  originalSizeKB: number;
  onDownload: () => void;
  isProcessing: boolean;
}

const FORMAT_OPTIONS: { value: ImageFormat; label: string; description: string }[] = [
  { value: 'image/jpeg', label: 'JPEG', description: '适合照片，文件较小' },
  { value: 'image/png', label: 'PNG', description: '支持透明，质量高' },
  { value: 'image/webp', label: 'WebP', description: '现代格式，压缩率高' },
  { value: 'image/gif', label: 'GIF', description: '支持动画' },
  { value: 'image/bmp', label: 'BMP', description: '无压缩，文件较大' },
];

export function FormatSettings({
  format,
  onFormatChange,
  quality,
  onQualityChange,
  targetSizeKB,
  onTargetSizeChange,
  originalSizeKB,
  onDownload,
  isProcessing
}: FormatSettingsProps) {
  const formatExtension = getFileExtension(format);

  return (
    <div className="space-y-4">
      {/* 格式选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          输出格式
        </label>
        <div className="grid grid-cols-2 gap-2">
          {FORMAT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onFormatChange(option.value)}
              className={`
                flex items-start gap-2 p-3 text-left rounded-lg border transition-all duration-200
                ${format === option.value
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-700'
                }
              `}
            >
              <div className={`
                p-1.5 rounded-md
                ${format === option.value ? 'bg-purple-200 dark:bg-purple-800' : 'bg-gray-100 dark:bg-gray-700'}
              `}>
                <FileImage size={16} className={format === option.value ? 'text-purple-700 dark:text-purple-300' : 'text-gray-500 dark:text-gray-400'} />
              </div>
              <div>
                <div className={`
                  text-sm font-medium
                  ${format === option.value ? 'text-purple-700 dark:text-purple-300' : 'text-gray-800 dark:text-gray-200'}
                `}>
                  {option.label}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {option.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 质量调整 */}
      {format === 'image/jpeg' && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              图片质量
            </label>
            <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
              {Math.round(quality * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={Math.round(quality * 100)}
            onChange={(e) => onQualityChange(parseInt(e.target.value) / 100)}
            className="
              w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer
              accent-purple-600
            "
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>低质量 (小文件)</span>
            <span>高质量 (大文件)</span>
          </div>
        </div>
      )}

      {/* 目标文件大小 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          目标文件大小
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="1"
            value={targetSizeKB || ''}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              onTargetSizeChange(isNaN(value) || value <= 0 ? null : value);
            }}
            placeholder="不限"
            className="
              flex-1 px-3 py-2 text-sm
              bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600
              rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent
              text-gray-800 dark:text-gray-200
            "
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">KB</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          原图大小: {originalSizeKB.toFixed(1)} KB
          {targetSizeKB && (
            <span className="ml-2">
              {targetSizeKB < originalSizeKB ? '(将压缩)' : '(将放大)'}
            </span>
          )}
        </p>
      </div>

      {/* 下载按钮 */}
      <button
        onClick={onDownload}
        disabled={isProcessing}
        className="
          w-full flex items-center justify-center gap-2 py-3 px-4
          bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400
          text-white font-medium rounded-lg
          transition-colors duration-200
          shadow-lg shadow-purple-600/20
        "
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            处理中...
          </>
        ) : (
          <>
            <Download size={20} />
            下载图片 (.{formatExtension})
          </>
        )}
      </button>
    </div>
  );
}
