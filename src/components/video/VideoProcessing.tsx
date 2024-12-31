import React from 'react';

interface VideoProcessingProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  transitionType: 'none' | 'fade' | 'crossfade';
  blurRegions: Array<{ x: number; y: number; width: number; height: number }>;
  captions: Array<{ text: string; startTime: number; endTime: number }>;
  annotations: Array<{ text: string; timestamp: number; author: string }>;
  watermark: {
    image: HTMLImageElement;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    opacity: number;
    size: number;
  } | null;
}

export const processVideoFrame = ({
  videoRef,
  transitionType,
  blurRegions,
  captions,
  annotations,
  watermark
}: VideoProcessingProps, outputCtx: CanvasRenderingContext2D, progress: number) => {
  if (!videoRef.current || !outputCtx) return;

  // Apply transition
  switch (transitionType) {
    case 'fade':
      outputCtx.globalAlpha = progress;
      break;
    case 'crossfade':
      outputCtx.globalAlpha = Math.sin(progress * Math.PI / 2);
      break;
    default:
      outputCtx.globalAlpha = 1;
  }

  // Draw video frame
  outputCtx.drawImage(videoRef.current, 0, 0);

  // Apply blur regions
  blurRegions.forEach(region => {
    const imageData = outputCtx.getImageData(region.x, region.y, region.width, region.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = 0;
      imageData.data[i + 1] = 0;
      imageData.data[i + 2] = 0;
    }
    outputCtx.putImageData(imageData, region.x, region.y);
  });

  // Draw captions
  const currentTime = videoRef.current.currentTime;
  const activeCaption = captions.find(
    caption => currentTime >= caption.startTime && currentTime <= caption.endTime
  );

  if (activeCaption) {
    outputCtx.font = '24px Arial';
    outputCtx.fillStyle = 'white';
    outputCtx.strokeStyle = 'black';
    outputCtx.lineWidth = 2;
    const text = activeCaption.text;
    const textMetrics = outputCtx.measureText(text);
    const x = (outputCtx.canvas.width - textMetrics.width) / 2;
    const y = outputCtx.canvas.height - 50;
    
    outputCtx.strokeText(text, x, y);
    outputCtx.fillText(text, x, y);
  }

  // Draw annotations
  const activeAnnotation = annotations.find(
    annotation => Math.abs(currentTime - annotation.timestamp) < 0.5
  );

  if (activeAnnotation) {
    outputCtx.font = '18px Arial';
    outputCtx.fillStyle = 'yellow';
    outputCtx.strokeStyle = 'black';
    outputCtx.lineWidth = 1;
    const text = `${activeAnnotation.author}: ${activeAnnotation.text}`;
    const textMetrics = outputCtx.measureText(text);
    const x = (outputCtx.canvas.width - textMetrics.width) / 2;
    const y = 30;
    
    outputCtx.strokeText(text, x, y);
    outputCtx.fillText(text, x, y);
  }

  // Draw watermark
  if (watermark) {
    outputCtx.globalAlpha = watermark.opacity;
    
    const watermarkWidth = (outputCtx.canvas.width * watermark.size) / 100;
    const watermarkHeight = (watermarkWidth / watermark.image.width) * watermark.image.height;
    
    let x = 0;
    let y = 0;
    
    switch (watermark.position) {
      case 'top-left':
        x = 20;
        y = 20;
        break;
      case 'top-right':
        x = outputCtx.canvas.width - watermarkWidth - 20;
        y = 20;
        break;
      case 'bottom-left':
        x = 20;
        y = outputCtx.canvas.height - watermarkHeight - 20;
        break;
      case 'bottom-right':
        x = outputCtx.canvas.width - watermarkWidth - 20;
        y = outputCtx.canvas.height - watermarkHeight - 20;
        break;
    }
    
    outputCtx.drawImage(watermark.image, x, y, watermarkWidth, watermarkHeight);
    outputCtx.globalAlpha = 1;
  }
};