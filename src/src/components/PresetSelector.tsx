/**
 * 预设尺寸选择器组件
 * 提供平台预设尺寸选择和自定义尺寸输入
 */

import React, { useState, useMemo } from 'react';
import { ChevronDown, Monitor, ShoppingBag, Briefcase, Settings } from 'lucide-react';
import type { PlatformPreset, CropOptions } from '../lib/imageProcessor';
import { PLATFORM_PRESETS } from '../lib/imageProcessor';

interface PresetSelectorProps {
  imageWidth: number;
  imageHeight: number;
  onSelect: (crop: CropOptions) => void;
  customWidth: number;
  customHeight: number;
  onCustomWidthChange: (width: number) => void;
  onCustomHeightChange: (height: number) => void;
}

type Category = '全部' | '社交媒体' | '电商平台' | '求职简历' | '自定义';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  '社交媒体': <Monitor size={16} />,
  '电商平台': <ShoppingBag size={16} />,
  '求职简历': <Briefcase size={16} />,
  '自定义': <Settings size={16} />
};

export function PresetSelector({
  imageWidth,
  imageHeight,
  onSelect,
  customWidth,
  customHeight,
  onCustomWidthChange,
  onCustomHeightChange
}: PresetSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('全部');
  const [isExpanded, setIsExpanded] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(PLATFORM_PRESETS.map(p => p.category));
    return ['全部', ...Array.from(cats), '自定义'] as Category[];
  }, []);

  const filteredPresets = useMemo(() => {
    if (activeCategory === '全部') return PLATFORM_PRESETS;
    if (activeCategory === '自定义') return [];
    return PLATFORM_PRESETS.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  const handlePresetClick = (preset: PlatformPreset) => {
    // 计算居中裁剪区域
    const aspectRatio = preset.width / preset.height;
    const imgAspectRatio = imageWidth / imageHeight;
    
    let cropWidth: number;
    let cropHeight: number;
    
    if (imgAspectRatio > aspectRatio) {
      // 图片更宽，以高度为基准
      cropHeight = imageHeight;
      cropWidth = cropHeight * aspectRatio;
    } else {
      // 图片更高，以宽度为基准
      cropWidth = imageWidth;
      cropHeight = cropWidth / aspectRatio;
    }
    
    const crop: CropOptions = {
      x: (imageWidth - cropWidth) / 2,
      y: (imageHeight - cropHeight) / 2,
      width: cropWidth,
      height: cropHeight
    };
    
    onSelect(crop);
  };

  const handleCustomApply = () => {
    if (customWidth > 0 && customHeight > 0) {
      // 计算居中裁剪区域
      const aspectRatio = customWidth / customHeight;
      const imgAspectRatio = imageWidth / imageHeight;
      
      let cropWidth: number;
      let cropHeight: number;
      
      if (imgAspectRatio > aspectRatio) {
        cropHeight = imageHeight;
        cropWidth = cropHeight * aspectRatio;
      } else {
        cropWidth = imageWidth;
        cropHeight = cropWidth / aspectRatio;
      }
      
      const crop: CropOptions = {
        x: (imageWidth - cropWidth) / 2,
        y: (imageHeight - cropHeight) / 2,
        width: cropWidth,
        height: cropHeight
      };
      
      onSelect(crop);
    }
  };

  return (
    <div className="space-y-3">
      {/* 分类标签 */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full
              transition-colors duration-200
              ${activeCategory === category
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }
            `}
          >
            {CATEGORY_ICONS[category]}
            {category}
          </button>
        ))}
      </div>

      {/* 预设列表 */}
      {activeCategory !== '自定义' && (
        <div className={`
          grid grid-cols-2 gap-2 overflow-hidden transition-all duration-300
          ${isExpanded ? 'max-h-96' : 'max-h-32'}
        `}>
          {filteredPresets.map((preset, index) => (
            <button
              key={`${preset.name}-${index}`}
              onClick={() => handlePresetClick(preset)}
              className="
                flex flex-col items-start p-3 text-left
                bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                rounded-lg hover:border-purple-400 dark:hover:border-purple-500
                hover:shadow-md transition-all duration-200
              "
            >
              <span className="font-medium text-sm text-gray-800 dark:text-gray-200">
                {preset.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {preset.width} × {preset.height === 0 ? '不限' : preset.height} px
              </span>
              {preset.description && (
                <span className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  {preset.description}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* 展开/收起按钮 */}
      {activeCategory !== '自定义' && filteredPresets.length > 4 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 mx-auto"
        >
          {isExpanded ? '收起' : '展开更多'}
          <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      )}

      {/* 自定义尺寸 */}
      {activeCategory === '自定义' && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                宽度 (px)
              </label>
              <input
                type="number"
                min="1"
                max={imageWidth}
                value={customWidth || ''}
                onChange={(e) => onCustomWidthChange(parseInt(e.target.value) || 0)}
                className="
                  w-full px-3 py-2 text-sm
                  bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600
                  rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent
                  text-gray-800 dark:text-gray-200
                "
                placeholder="输入宽度"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                高度 (px)
              </label>
              <input
                type="number"
                min="1"
                max={imageHeight}
                value={customHeight || ''}
                onChange={(e) => onCustomHeightChange(parseInt(e.target.value) || 0)}
                className="
                  w-full px-3 py-2 text-sm
                  bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600
                  rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent
                  text-gray-800 dark:text-gray-200
                "
                placeholder="输入高度"
              />
            </div>
          </div>
          <button
            onClick={handleCustomApply}
            disabled={!customWidth || !customHeight}
            className="
              w-full py-2 px-4 text-sm font-medium text-white
              bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400
              rounded-md transition-colors duration-200
            "
          >
            应用尺寸
          </button>
        </div>
      )}
    </div>
  );
}
