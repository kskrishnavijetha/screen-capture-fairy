import { useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { processVideoFrame } from '../components/video/VideoProcessing';
import { Resolution } from '@/types/recording';
import { Timestamp } from '@/types/media';

interface ProcessingOptions {
  recordedBlob: Blob;
  videoRef: React.RefObject<HTMLVideoElement>;
  transitionType: 'none' | 'fade' | 'crossfade';
  blurRegions: Array<{ x: number; y: number; width: number; height: number }>;
  captions: Array<{ startTime: number; endTime: number; text: string }>;
  annotations: Array<{ id: string; timestamp: number; text: string; author: string }>;
  watermark: {
    image: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    opacity: number;
    size: number;
  } | null;
  timestamps: Timestamp[];
  trimRange: number[];
  duration: number;
}

export const useVideoProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processVideo = async ({
    recordedBlob,
    videoRef,
    transitionType,
    blurRegions,
    captions,
    annotations,
    watermark,
    timestamps,
    trimRange,
    duration
  }: ProcessingOptions): Promise<Blob> => {
    if (!recordedBlob || !videoRef.current) {
      throw new Error("No video to process");
    }

    setIsProcessing(true);
    console.log('Starting video processing...');
    
    try {
      // Calculate start and end times, ensuring they are finite numbers
      const startTime = Math.max(0, (trimRange[0] / 100) * duration);
      const endTime = Math.min(duration, (trimRange[1] / 100) * duration);

      console.log('Processing time range:', { startTime, endTime, duration });

      if (!isFinite(startTime) || !isFinite(endTime)) {
        throw new Error('Invalid time range calculated');
      }

      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = videoRef.current.videoWidth || 1280;
      outputCanvas.height = videoRef.current.videoHeight || 720;
      const outputCtx = outputCanvas.getContext('2d');
      
      if (!outputCtx) {
        throw new Error('Could not get canvas context');
      }

      const mediaStream = outputCanvas.captureStream();
      const mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: recordedBlob.type,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

      let watermarkImg: HTMLImageElement | null = null;
      if (watermark) {
        watermarkImg = new Image();
        watermarkImg.src = watermark.image;
        await new Promise((resolve) => {
          watermarkImg!.onload = resolve;
        });
      }

      return new Promise((resolve, reject) => {
        mediaRecorder.onstop = () => {
          const newBlob = new Blob(chunks, { type: recordedBlob.type });
          setIsProcessing(false);
          resolve(newBlob);
        };

        const processFrame = async () => {
          if (!videoRef.current || !outputCtx) return;

          const currentTime = videoRef.current.currentTime;
          const progress = (currentTime - startTime) / (endTime - startTime);

          console.log('Processing frame at time:', currentTime);

          processVideoFrame({
            videoRef,
            transitionType,
            blurRegions,
            captions,
            annotations,
            watermark: watermark ? { ...watermark, image: watermarkImg! } : null,
            timestamps,
            trimRange
          }, outputCtx, progress);

          if (currentTime < endTime) {
            const nextTime = currentTime + (1/30); // Process at 30fps
            if (isFinite(nextTime) && nextTime <= endTime) {
              videoRef.current.currentTime = nextTime;
              requestAnimationFrame(processFrame);
            } else {
              mediaRecorder.stop();
              videoRef.current.pause();
            }
          } else {
            mediaRecorder.stop();
            videoRef.current.pause();
          }
        };

        // Start processing from the beginning
        videoRef.current.currentTime = startTime;
        videoRef.current.onseeked = () => {
          mediaRecorder.start();
          processFrame().catch(reject);
        };
      });
    } catch (error) {
      console.error('Video processing error:', error);
      setIsProcessing(false);
      throw error;
    }
  };

  return {
    isProcessing,
    processVideo
  };
};