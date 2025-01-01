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
  const canvas = outputCtx.canvas;
  
  // Clear canvas and draw video frame
  outputCtx.clearRect(0, 0, canvas.width, canvas.height);
  outputCtx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

  // Apply blur regions using a temporary canvas
  if (blurRegions.length > 0) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (tempCtx) {
      tempCtx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      blurRegions.forEach(region => {
        const scaledRegion = {
          x: (region.x / videoRef.current!.offsetWidth) * canvas.width,
          y: (region.y / videoRef.current!.offsetHeight) * canvas.height,
          width: (region.width / videoRef.current!.offsetWidth) * canvas.width,
          height: (region.height / videoRef.current!.offsetHeight) * canvas.height
        };

        tempCtx.filter = 'blur(15px)';
        tempCtx.drawImage(
          canvas,
          scaledRegion.x, scaledRegion.y, scaledRegion.width, scaledRegion.height,
          scaledRegion.x, scaledRegion.y, scaledRegion.width, scaledRegion.height
        );
      });
      
      outputCtx.drawImage(tempCanvas, 0, 0);
    }
  }

  // Apply captions
  const activeCaption = captions.find(
    caption => currentTime >= caption.startTime && currentTime <= caption.endTime
  );

  if (activeCaption) {
    outputCtx.save();
    outputCtx.font = `${Math.floor(canvas.height * 0.05)}px Arial`;
    outputCtx.fillStyle = 'white';
    outputCtx.strokeStyle = 'black';
    outputCtx.lineWidth = Math.floor(canvas.height * 0.002);
    outputCtx.textAlign = 'center';
    
    const text = activeCaption.text;
    const x = canvas.width / 2;
    const y = canvas.height * 0.9;
    
    outputCtx.strokeText(text, x, y);
    outputCtx.fillText(text, x, y);
    outputCtx.restore();
  }

  // Apply annotations
  const activeAnnotation = annotations.find(
    annotation => Math.abs(currentTime - annotation.timestamp) < 0.5
  );

  if (activeAnnotation) {
    outputCtx.save();
    outputCtx.font = `${Math.floor(canvas.height * 0.04)}px Arial`;
    outputCtx.fillStyle = 'yellow';
    outputCtx.strokeStyle = 'black';
    outputCtx.lineWidth = Math.floor(canvas.height * 0.002);
    outputCtx.textAlign = 'center';
    
    const text = `${activeAnnotation.author}: ${activeAnnotation.text}`;
    const x = canvas.width / 2;
    const y = canvas.height * 0.1;
    
    outputCtx.strokeText(text, x, y);
    outputCtx.fillText(text, x, y);
    outputCtx.restore();
  }

  // Apply watermark
  if (watermark && watermark.image) {
    outputCtx.save();
    outputCtx.globalAlpha = watermark.opacity;
    
    const watermarkWidth = (canvas.width * watermark.size) / 100;
    const watermarkHeight = (watermarkWidth / watermark.image.width) * watermark.image.height;
    const padding = Math.floor(canvas.width * 0.02); // 2% padding
    
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

  // Apply transition effect
  if (transitionType !== 'none') {
    outputCtx.save();
    switch (transitionType) {
      case 'fade':
        outputCtx.fillStyle = `rgba(0, 0, 0, ${1 - progress})`;
        outputCtx.fillRect(0, 0, canvas.width, canvas.height);
        break;
      case 'crossfade':
        outputCtx.globalAlpha = Math.sin(progress * Math.PI / 2);
        break;
    }
    outputCtx.restore();
  }
};