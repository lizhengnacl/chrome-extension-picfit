/**
 * 图片处理核心模块
 * 提供图片裁剪、旋转、翻转、压缩、格式转换、插值放大等功能
 */

export type ImageFormat = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' | 'image/bmp' | 'image/tiff';

export interface CropOptions {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ProcessOptions {
  crop?: CropOptions;
  rotation?: number;
  flipH?: boolean;
  flipV?: boolean;
  targetWidth?: number;
  targetHeight?: number;
  quality?: number;
  format?: ImageFormat;
  targetSizeKB?: number;
}

export interface PlatformPreset {
  name: string;
  category: string;
  width: number;
  height: number;
  description?: string;
}

const 不限 = 0;

// 平台预设尺寸
export const PLATFORM_PRESETS: PlatformPreset[] = [
  // 社交媒体
  { name: '微信头像', category: '社交媒体', width: 200, height: 200, description: '圆形头像' },
  { name: '微信朋友圈封面', category: '社交媒体', width: 720, height: 720, description: '正方形' },
  { name: '微博头像', category: '社交媒体', width: 180, height: 180 },
  { name: '微博封面', category: '社交媒体', width: 920, height: 300 },
  { name: 'Instagram帖子', category: '社交媒体', width: 1080, height: 1080 },
  { name: 'Instagram故事', category: '社交媒体', width: 1080, height: 1920 },
  { name: '抖音头像', category: '社交媒体', width: 400, height: 400 },
  { name: '小红书封面', category: '社交媒体', width: 1242, height: 1660 },
  
  // 电商平台
  { name: '淘宝主图', category: '电商平台', width: 800, height: 800 },
  { name: '淘宝详情', category: '电商平台', width: 790, height: 不限, description: '宽度固定' },
  { name: '京东主图', category: '电商平台', width: 800, height: 800 },
  { name: '拼多多主图', category: '电商平台', width: 750, height: 750 },
  
  // 求职简历
  { name: '一寸证件照', category: '求职简历', width: 295, height: 413 },
  { name: '二寸证件照', category: '求职简历', width: 413, height: 579 },
  { name: '简历照片', category: '求职简历', width: 295, height: 413 },
  { name: 'LinkedIn头像', category: '求职简历', width: 400, height: 400 },
  { name: 'LinkedIn封面', category: '求职简历', width: 1584, height: 396 },
];

/**
 * 加载图片文件为Image对象
 */
export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * 创建Canvas并绘制图片
 */
export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/**
 * 应用旋转和翻转变换
 */
export function applyTransformations(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  rotation: number,
  flipH: boolean,
  flipV: boolean
): void {
  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  
  if (rotation !== 0) {
    ctx.rotate((rotation * Math.PI) / 180);
  }
  
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.translate(-canvasWidth / 2, -canvasHeight / 2);
}

/**
 * 双线性插值算法 - 高质量图片放大
 */
export function bilinearInterpolation(
  srcCanvas: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement {
  const srcCtx = srcCanvas.getContext('2d')!;
  const srcData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
  const srcPixels = srcData.data;
  
  const dstCanvas = createCanvas(targetWidth, targetHeight);
  const dstCtx = dstCanvas.getContext('2d')!;
  const dstData = dstCtx.createImageData(targetWidth, targetHeight);
  const dstPixels = dstData.data;
  
  const xScale = srcCanvas.width / targetWidth;
  const yScale = srcCanvas.height / targetHeight;
  
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const srcX = x * xScale;
      const srcY = y * yScale;
      
      const x0 = Math.floor(srcX);
      const y0 = Math.floor(srcY);
      const x1 = Math.min(x0 + 1, srcCanvas.width - 1);
      const y1 = Math.min(y0 + 1, srcCanvas.height - 1);
      
      const fx = srcX - x0;
      const fy = srcY - y0;
      
      for (let c = 0; c < 4; c++) {
        const v00 = srcPixels[(y0 * srcCanvas.width + x0) * 4 + c];
        const v10 = srcPixels[(y0 * srcCanvas.width + x1) * 4 + c];
        const v01 = srcPixels[(y1 * srcCanvas.width + x0) * 4 + c];
        const v11 = srcPixels[(y1 * srcCanvas.width + x1) * 4 + c];
        
        const v0 = v00 * (1 - fx) + v10 * fx;
        const v1 = v01 * (1 - fx) + v11 * fx;
        const v = v0 * (1 - fy) + v1 * fy;
        
        dstPixels[(y * targetWidth + x) * 4 + c] = Math.round(v);
      }
    }
  }
  
  dstCtx.putImageData(dstData, 0, 0);
  return dstCanvas;
}

/**
 * 处理图片 - 主函数
 * 统一约定：crop 坐标始终表示未变换的原图上的区域！
 */
export async function processImage(
  image: HTMLImageElement,
  options: ProcessOptions
): Promise<Blob> {
  const {
    crop,
    rotation = 0,
    flipH = false,
    flipV = false,
    targetWidth,
    targetHeight,
    quality = 0.92,
    format = 'image/jpeg',
    targetSizeKB
  } = options;
  
  // 第一步：先从原图裁剪（crop 坐标是原图的！）
  let workingImage: HTMLImageElement | HTMLCanvasElement = image;
  let workingWidth = image.naturalWidth;
  let workingHeight = image.naturalHeight;
  
  if (crop) {
    const cropCanvas = createCanvas(crop.width, crop.height);
    const cropCtx = cropCanvas.getContext('2d')!;
    cropCtx.drawImage(
      image,
      crop.x, crop.y, crop.width, crop.height,
      0, 0, crop.width, crop.height
    );
    workingImage = cropCanvas;
    workingWidth = crop.width;
    workingHeight = crop.height;
  }
  
  // 第二步：计算输出尺寸
  let outputWidth = workingWidth;
  let outputHeight = workingHeight;
  
  if (targetWidth && targetHeight) {
    outputWidth = targetWidth;
    outputHeight = targetHeight;
  }
  
  // 处理旋转后的尺寸
  const isRotated90 = Math.abs(rotation) % 180 === 90;
  const canvasWidth = isRotated90 ? outputHeight : outputWidth;
  const canvasHeight = isRotated90 ? outputWidth : outputHeight;
  
  // 第三步：创建最终画布，应用变换并绘制
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d')!;
  
  // 应用变换
  applyTransformations(ctx, canvasWidth, canvasHeight, rotation, flipH, flipV);
  
  // 绘制图片
  ctx.drawImage(
    workingImage,
    -outputWidth / 2, -outputHeight / 2, outputWidth, outputHeight
  );
  
  // 如果需要放大，使用插值算法
  if (targetWidth && targetHeight && 
      (targetWidth > workingWidth || targetHeight > workingHeight)) {
    const scaledCanvas = bilinearInterpolation(canvas, targetWidth, targetHeight);
    return canvasToBlob(scaledCanvas, format, quality, targetSizeKB);
  }
  
  return canvasToBlob(canvas, format, quality, targetSizeKB);
}

/**
 * Canvas转Blob，支持目标文件大小调整
 */
async function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: ImageFormat,
  initialQuality: number,
  targetSizeKB?: number
): Promise<Blob> {
  let quality = initialQuality;
  let blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), format, quality);
  });
  
  // 如果指定了目标大小，进行二分查找调整质量
  if (targetSizeKB && format === 'image/jpeg') {
    const targetSize = targetSizeKB * 1024;
    let minQuality = 0.1;
    let maxQuality = 1.0;
    
    // 如果初始质量太大，降低质量
    if (blob.size > targetSize) {
      for (let i = 0; i < 8 && Math.abs(blob.size - targetSize) > targetSize * 0.1; i++) {
        if (blob.size > targetSize) {
          maxQuality = quality;
          quality = (minQuality + quality) / 2;
        } else {
          minQuality = quality;
          quality = (quality + maxQuality) / 2;
        }
        
        blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), format, quality);
        });
      }
    }
  }
  
  return blob;
}

/**
 * 下载Blob为文件
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(format: ImageFormat): string {
  const map: Record<ImageFormat, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/bmp': 'bmp',
    'image/tiff': 'tiff'
  };
  return map[format];
}
