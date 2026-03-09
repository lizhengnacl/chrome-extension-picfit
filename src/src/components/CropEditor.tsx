/**
 * 裁剪编辑器组件
 * 提供图片裁剪功能
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Grid3X3, Lock, Unlock } from 'lucide-react';
import type { CropOptions } from '../lib/imageProcessor';

interface CropEditorProps {
  image: HTMLImageElement;
  crop: CropOptions;
  onCropChange: (crop: CropOptions) => void;
  aspectRatio: number | null;
  onAspectRatioChange: (ratio: number | null) => void;
  showGrid: boolean;
  onShowGridChange: (show: boolean) => void;
}

type ResizeHandle = 'tl' | 'tr' | 'bl' | 'br' | null;

export function CropEditor({
  image,
  crop,
  onCropChange,
  aspectRatio,
  onAspectRatioChange,
  showGrid,
  onShowGridChange
}: CropEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [startCrop, setStartCrop] = useState<CropOptions | null>(null);
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

    // 绘制图片
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

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
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillRect(cropX, cropY, cropW, cropH);
      ctx.globalCompositeOperation = 'source-over';
      
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
  }, [image, crop, showGrid]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !crop) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const x = screenX / canvasScale;
    const y = screenY / canvasScale;

    // 检查是否点击了角落控制点
    const handleSize = 16;
    const handles = [
      { id: 'tl', x: crop.x, y: crop.y },
      { id: 'tr', x: crop.x + crop.width, y: crop.y },
      { id: 'bl', x: crop.x, y: crop.y + crop.height },
      { id: 'br', x: crop.x + crop.width, y: crop.y + crop.height },
    ];

    for (const handle of handles) {
      const dx = x - handle.x;
      const dy = y - handle.y;
      if (Math.abs(dx) <= handleSize / canvasScale && Math.abs(dy) <= handleSize / canvasScale) {
        setIsResizing(true);
        setResizeHandle(handle.id as ResizeHandle);
        setDragStart({ x, y });
        setStartCrop({ ...crop });
        return;
      }
    }

    // 检查是否在裁剪框内（用于拖动）
    if (x >= crop.x && x <= crop.x + crop.width &&
        y >= crop.y && y <= crop.y + crop.height) {
      setIsDragging(true);
      setDragStart({ x: x - crop.x, y: y - crop.y });
    }
  }, [crop, canvasScale]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!crop) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const x = screenX / canvasScale;
    const y = screenY / canvasScale;

    if (isDragging) {
      const newX = Math.max(0, Math.min(x - dragStart.x, image.naturalWidth - crop.width));
      const newY = Math.max(0, Math.min(y - dragStart.y, image.naturalHeight - crop.height));
      onCropChange({ ...crop, x: newX, y: newY });
    } else if (isResizing && resizeHandle && startCrop) {
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;

      let newX = startCrop.x;
      let newY = startCrop.y;
      let newWidth = startCrop.width;
      let newHeight = startCrop.height;

      // 根据不同的控制点调整
      switch (resizeHandle) {
        case 'tl':
          newX = Math.max(0, startCrop.x + dx);
          newY = Math.max(0, startCrop.y + dy);
          newWidth = startCrop.width - (newX - startCrop.x);
          newHeight = startCrop.height - (newY - startCrop.y);
          break;
        case 'tr':
          newY = Math.max(0, startCrop.y + dy);
          newWidth = Math.min(image.naturalWidth - startCrop.x, startCrop.width + dx);
          newHeight = startCrop.height - (newY - startCrop.y);
          break;
        case 'bl':
          newX = Math.max(0, startCrop.x + dx);
          newWidth = startCrop.width - (newX - startCrop.x);
          newHeight = Math.min(image.naturalHeight - startCrop.y, startCrop.height + dy);
          break;
        case 'br':
          newWidth = Math.min(image.naturalWidth - startCrop.x, startCrop.width + dx);
          newHeight = Math.min(image.naturalHeight - startCrop.y, startCrop.height + dy);
          break;
      }

      // 确保最小尺寸
      newWidth = Math.max(20, newWidth);
      newHeight = Math.max(20, newHeight);

      // 如果锁定了宽高比
      if (aspectRatio) {
        const targetRatio = aspectRatio;
        if (newWidth / newHeight > targetRatio) {
          newWidth = newHeight * targetRatio;
        } else {
          newHeight = newWidth / targetRatio;
        }
        // 重新调整位置以保持控制点
        if (resizeHandle === 'tl') {
          newX = startCrop.x + startCrop.width - newWidth;
          newY = startCrop.y + startCrop.height - newHeight;
        } else if (resizeHandle === 'tr') {
          newY = startCrop.y + startCrop.height - newHeight;
        } else if (resizeHandle === 'bl') {
          newX = startCrop.x + startCrop.width - newWidth;
        }
      }

      // 确保不超出边界
      newX = Math.max(0, Math.min(newX, image.naturalWidth - newWidth));
      newY = Math.max(0, Math.min(newY, image.naturalHeight - newHeight));

      onCropChange({ x: newX, y: newY, width: newWidth, height: newHeight });
    }
  }, [isDragging, isResizing, crop, startCrop, dragStart, resizeHandle, image.naturalWidth, image.naturalHeight, canvasScale, aspectRatio, onCropChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    setStartCrop(null);
  }, []);

  const handleMouseMoveCursor = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !crop) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const x = screenX / canvasScale;
    const y = screenY / canvasScale;

    const handleSize = 16;
    const handles = [
      { id: 'tl', x: crop.x, y: crop.y, cursor: 'nwse-resize' },
      { id: 'tr', x: crop.x + crop.width, y: crop.y, cursor: 'nesw-resize' },
      { id: 'bl', x: crop.x, y: crop.y + crop.height, cursor: 'nesw-resize' },
      { id: 'br', x: crop.x + crop.width, y: crop.y + crop.height, cursor: 'nwse-resize' },
    ];

    let cursor = 'default';
    for (const handle of handles) {
      const dx = x - handle.x;
      const dy = y - handle.y;
      if (Math.abs(dx) <= handleSize / canvasScale && Math.abs(dy) <= handleSize / canvasScale) {
        cursor = handle.cursor;
        break;
      }
    }

    if (cursor === 'default' && 
        x >= crop.x && x <= crop.x + crop.width &&
        y >= crop.y && y <= crop.y + crop.height) {
      cursor = 'move';
    }

    canvas.style.cursor = cursor;
  }, [crop, canvasScale]);

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
          onMouseMove={(e) => {
            handleMouseMove(e);
            handleMouseMoveCursor(e);
          }}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ maxWidth: '100%', maxHeight: '400px' }}
        />
      </div>

      {/* 尺寸信息 */}
      {crop && (
        <div className="flex justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>裁剪尺寸: {Math.round(crop.width)} × {Math.round(crop.height)} px</span>
        </div>
      )}
    </div>
  );
}
