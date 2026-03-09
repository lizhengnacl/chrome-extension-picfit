/**
 * 上传区域组件
 * 提供拖拽上传和点击上传功能
 */

import React, { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string;
}

export function UploadZone({ onFileSelect, acceptedTypes = 'image/*' }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-xl p-8 text-center
        transition-all duration-200 cursor-pointer
        ${isDragging 
          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
          : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500'
        }
      `}
    >
      <input
        type="file"
        accept={acceptedTypes}
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      
      <div className="flex flex-col items-center gap-3">
        <div className={`
          p-4 rounded-full transition-colors duration-200
          ${isDragging 
            ? 'bg-purple-100 dark:bg-purple-800' 
            : 'bg-gray-100 dark:bg-gray-700'
          }
        `}>
          <Upload 
            size={32} 
            className={isDragging ? 'text-purple-600 dark:text-purple-300' : 'text-gray-500 dark:text-gray-400'}
          />
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
            拖拽图片到此处，或点击上传
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            支持 JPG、PNG、GIF、WebP 等格式
          </p>
        </div>
      </div>
    </div>
  );
}
