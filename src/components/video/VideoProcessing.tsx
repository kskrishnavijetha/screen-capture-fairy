import React from 'react';
import { formatTime } from '@/utils/timeUtils';

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
  timestamps: Array<{ time: number; label: string }>;
  trimRange: number[];
}

export const processVideoFrame = ({
  videoRef,
  transitionType,
  blurRegions,
  captions,
  annotations,
  watermark,
  timestamps,
  trimRange
}: VideoProcessingProps, outputCtx: CanvasRenderingContext2D, progress: number) => {
  if (!videoRef.current || !outputCtx) return;

  const currentTime = videoRef.current.currentTime;
  
  // Clear canvas
  outputCtx.clearRect(0, 0, outputCtx.canvas.width, outputCtx.canvas.height);

  // Draw video frame
  outputCtx.drawImage(videoRef.current, 0, 0, outputCtx.canvas.width, outputCtx.canvas.height);

  // Apply transition
  switch (transitionType) {
    case 'fade':
      outputCtx.fillStyle = `rgba(0, 0, 0, ${1 - progress})`;
      outputCtx.fillRect(0, 0, outputCtx.canvas.width, outputCtx.canvas.height);
      break;
    case 'crossfade':
      outputCtx.globalAlpha = Math.sin(progress * Math.PI / 2);
      break;
  }

  // Apply blur regions
  blurRegions.forEach(region => {
    const scaledRegion = {
      x: (region.x / videoRef.current!.offsetWidth) * outputCtx.canvas.width,
      y: (region.y / videoRef.current!.offsetHeight) * outputCtx.canvas.height,
      width: (region.width / videoRef.current!.offsetWidth) * outputCtx.canvas.width,
      height: (region.height / videoRef.current!.offsetHeight) * outputCtx.canvas.height
    };

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = scaledRegion.width;
    tempCanvas.height = scaledRegion.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (tempCtx) {
      tempCtx.filter = 'blur(10px)';
      tempCtx.drawImage(
        videoRef.current!,
        scaledRegion.x, scaledRegion.y, scaledRegion.width, scaledRegion.height,
        0, 0, scaledRegion.width, scaledRegion.height
      );
      outputCtx.drawImage(tempCanvas, scaledRegion.x, scaledRegion.y);
    }
  });

  // Draw captions
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