import React from 'react';

interface VideoProcessingProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  blurRegions: Array<{ x: number; y: number; width: number; height: number }>;
  watermark: {
    image: HTMLImageElement;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    opacity: number;
    size: number;
  } | null;
  timestamps: Array<{ time: number; label: string }>;
}

export const processVideoFrame = ({
  videoRef,
  blurRegions,
  watermark,
  timestamps,
}: VideoProcessingProps, outputCtx: CanvasRenderingContext2D, progress: number) => {
  if (!videoRef.current || !outputCtx) return;

  const currentTime = videoRef.current.currentTime;
  const canvas = outputCtx.canvas;
  
  // Clear canvas and draw video frame
  outputCtx.clearRect(0, 0, canvas.width, canvas.height);
  outputCtx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

  // Apply blur regions
  if (blurRegions.length > 0) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    
    if (tempCtx) {
      tempCtx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      blurRegions.forEach(region => {
        const scaledRegion = {
          x: (region.x / videoRef.current!.offsetWidth) * canvas.width,
          y: (region.y / videoRef.current!.offsetHeight) * canvas.height,
          width: (region.width / videoRef.current!.offsetWidth) * canvas.width,
          height: (region.height / videoRef.current!.offsetHeight) * canvas.height
        };

        // Apply stronger blur effect
        tempCtx.filter = 'blur(20px)';
        tempCtx.drawImage(
          canvas,
          scaledRegion.x, scaledRegion.y, scaledRegion.width, scaledRegion.height,
          scaledRegion.x, scaledRegion.y, scaledRegion.width, scaledRegion.height
        );
      });
      
      outputCtx.drawImage(tempCanvas, 0, 0);
      tempCtx.filter = 'none';
    }
  }

  // Apply watermark
  if (watermark && watermark.image) {
    outputCtx.save();
    outputCtx.globalAlpha = watermark.opacity;
    
    const maxWidth = canvas.width * (watermark.size / 100);
    const scaleFactor = maxWidth / watermark.image.width;
    const watermarkWidth = watermark.image.width * scaleFactor;
    const watermarkHeight = watermark.image.height * scaleFactor;
    
    const padding = Math.floor(canvas.width * 0.02);
    
    let x = padding;
    let y = padding;
    
    switch (watermark.position) {
      case 'top-right':
        x = canvas.width - watermarkWidth - padding;
        break;
      case 'bottom-left':
        y = canvas.height - watermarkHeight - padding;
        break;
      case 'bottom-right':
        x = canvas.width - watermarkWidth - padding;
        y = canvas.height - watermarkHeight - padding;
        break;
    }
    
    outputCtx.drawImage(watermark.image, x, y, watermarkWidth, watermarkHeight);
    outputCtx.restore();
  }
};