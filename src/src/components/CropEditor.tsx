/**
 * 裁剪编辑器组件
 * 提供图片裁剪、旋转、翻转功能
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCw, RotateCcw, FlipHorizontal, FlipVertical, Grid3X3, Lock, Unlock } from 'lucide-react';
import type { CropOptions, PlatformPreset } from '../lib/imageProcessor';

interface CropEditorProps {
  image: HTMLImageElement;
  crop: CropOptions;
  onCropChange: (crop: CropOptions) => void;
  rotation: number;
  onRotationChange: (rotation: number) => void;
  flipH: boolean;
  onFlipHChange: (flip: boolean) => void;
  flipV: boolean;
  onFlipVChange: (flip: boolean) => void;
  aspectRatio: number | null;
  onAspectRatioChange: (ratio: number | null) => void;
  showGrid: boolean;
  onShowGridChange: (show: boolean) => void;
}

export function CropEditor({
  image,
  crop,
  onCropChange,
  rotation,
  onRotationChange,
  flipH,
  onFlipHChange,
  flipV,
  onFlipVChange,
  aspectRatio,
  onAspectRatioChange,
  showGrid,
  onShowGridChange
}: CropEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [canvasScale, setCanvasScale] = useState(1);

  // 绘制预览
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 计算画布尺寸（限制最大显示尺寸）
    const maxWidth = 500;
    const maxHeight = 400;
    const scale = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight, 1);
    setCanvasScale(scale);

    canvas.width = image.naturalWidth * scale;
    canvas.height = image.naturalHeight * scale;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 保存上下文状态
    ctx.save();

    // 应用变换
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // 绘制图片
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // 恢复上下文状态
    ctx.restore();

    // 绘制裁剪框
    if (crop) {
      const cropX = crop.x * scale;
      const cropY = crop.y * scale;
      const cropW = crop.width * scale;
      const cropH = crop.height * scale;

      // 暗化裁剪区域外
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 清除裁剪区域
      ctx.clearRect(cropX, cropY, cropW, cropH);

      // 绘制裁剪边框
      ctx.strokeStyle = '#7c3aed';
      ctx.lineWidth = 2;
      ctx.strokeRect(cropX, cropY, cropW, cropH);

      // 绘制九宫格
      if (showGrid) {
        ctx.strokeStyle = 'rgba(124, 58, 237, 0.5)';
        ctx.lineWidth = 1;
        
        // 垂直线
        ctx.beginPath();
        ctx.moveTo(cropX + cropW / 3, cropY);
        ctx.lineTo(cropX + cropW / 3, cropY + cropH);
        ctx.moveTo(cropX + (cropW * 2) / 3, cropY);
        ctx.lineTo(cropX + (cropW * 2) / 3, cropY + cropH);
        ctx.stroke();

        // 水平线
        ctx.beginPath();
        ctx.moveTo(cropX, cropY + cropH / 3);
        ctx.lineTo(cropX + cropW, cropY + cropH / 3);
        ctx.moveTo(cropX, cropY + (cropH * 2) / 3);
        ctx.lineTo(cropX + cropW, cropY + (cropH * 2) / 3);
        ctx.stroke();
      }

      // 绘制角落控制点
      const handleSize = 8;
      ctx.fillStyle = '#7c3aed';
      
      // 四个角
      ctx.fillRect(cropX - handleSize/2, cropY - handleSize/2, handleSize, handleSize);
      ctx.fillRect(cropX + cropW - handleSize/2, cropY - handleSize/2, handleSize, handleSize);
      ctx.fillRect(cropX - handleSize/2, cropY + cropH - handleSize/2, handleSize, handleSize);
      ctx.fillRect(cropX + cropW - handleSize/2, cropY + cropH - handleSize/2, handleSize, handleSize);
    }
  }, [image, crop, rotation, flipH, flipV, showGrid]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvasScale;
    const y = (e.clientY - rect.top) / canvasScale;

    // 检查是否在裁剪框内
    if (crop && 
        x >= crop.x && x <= crop.x + crop.width &&
        y >= crop.y && y <= crop.y + crop.height) {
      setIsDragging(true);
      setDragStart({ x: x - crop.x, y: y - crop.y });
    }
  }, [crop, canvasScale]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !crop) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvasScale - dragStart.x;
    const y = (e.clientY - rect.top) / canvasScale - dragStart.y;

    const newX = Math.max(0, Math.min(x, image.naturalWidth - crop.width));
    const newY = Math.max(0, Math.min(y, image.naturalHeight - crop.height));

    onCropChange({ ...crop, x: newX, y: newY });
  }, [isDragging, crop, dragStart, image.naturalWidth, image.naturalHeight, canvasScale, onCropChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <button
          onClick={() => onRotationChange((rotation - 90) % 360)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <RotateCcw size={16} />
          左转
        </button>
        <button
          onClick={() => onRotationChange((rotation + 90) % 360)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <RotateCw size={16} />
          右转
        </button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
        <button
          onClick={() => onFlipHChange(!flipH)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            flipH 
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 border border-purple-300' 
              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
        >
          <FlipHorizontal size={16} />
          水平翻转
        </button>
        <button
          onClick={() => onFlipVChange(!flipV)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            flipV 
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 border border-purple-300' 
              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
        >
          <FlipVertical size={16} />
          垂直翻转
        </button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
        <button
          onClick={() => onShowGridChange(!showGrid)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            showGrid 
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 border border-purple-300' 
              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
        >
          <Grid3X3 size={16} />
          网格
        </button>
        <button
          onClick={() => onAspectRatioChange(aspectRatio ? null : 1)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            aspectRatio 
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 border border-purple-300' 
              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
        >
          {aspectRatio ? <Lock size={16} /> : <Unlock size={16} />}
          {aspectRatio ? '锁定比例' : '自由比例'}
        </button>
      </div>

      {/* 画布区域 */}
      <div 
        ref={containerRef}
        className="flex justify-center items-center bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden"
        style={{ minHeight: '300px' }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="cursor-move"
          style={{ maxWidth: '100%', maxHeight: '400px' }}
        />
      </div>

      {/* 尺寸信息 */}
      {crop && (
        <div className="flex justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>裁剪尺寸: {Math.round(crop.width)} × {Math.round(crop.height)} px</span>
          <span>旋转: {rotation}°</span>
        </div>
      )}
    </div>
  );
}
