import { processVideoFrame } from '../components/video/VideoProcessing';

export const setupCanvas = (width: number, height: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { 
    willReadFrequently: true,
    alpha: false 
  });
  
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  return { canvas, ctx };
};

export const createMediaRecorder = (canvas: HTMLCanvasElement, onDataAvailable: (data: BlobEvent) => void) => {
  const stream = canvas.captureStream(60);
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp8,opus',
    videoBitsPerSecond: 8000000
  });

  mediaRecorder.ondataavailable = onDataAvailable;
  return mediaRecorder;
};