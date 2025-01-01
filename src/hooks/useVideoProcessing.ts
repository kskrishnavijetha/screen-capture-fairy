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
    
    try {
      const startTime = (trimRange[0] / 100) * duration;
      const endTime = (trimRange[1] / 100) * duration;

      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = videoRef.current.videoWidth;
      outputCanvas.height = videoRef.current.videoHeight;
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

        videoRef.current!.currentTime = startTime;
        mediaRecorder.start();

        const processFrame = async () => {
          if (!videoRef.current || !outputCtx) return;

          const progress = (videoRef.current.currentTime - startTime) / (endTime - startTime);

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

          if (videoRef.current.currentTime < endTime) {
            videoRef.current.currentTime += 1/30; // Process at 30fps
            requestAnimationFrame(processFrame);
          } else {
            mediaRecorder.stop();
            videoRef.current.pause();
          }
        };

        videoRef.current!.onseeked = () => {
          processFrame().catch(reject);
        };
      });
    } catch (error) {
      setIsProcessing(false);
      throw error;
    }
  };

  return {
    isProcessing,
    processVideo
  };
};