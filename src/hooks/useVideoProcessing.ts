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
    console.log('Starting video processing with options:', {
      transitionType,
      hasBlurRegions: blurRegions.length,
      hasCaptions: captions.length,
      hasAnnotations: annotations.length,
      hasWatermark: !!watermark,
      trimRange
    });

    try {
      const startTime = Math.max(0, (trimRange[0] / 100) * duration);
      const endTime = Math.min(duration, (trimRange[1] / 100) * duration);

      if (!isFinite(startTime) || !isFinite(endTime)) {
        throw new Error('Invalid time range calculated');
      }

      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = videoRef.current.videoWidth || 1280;
      outputCanvas.height = videoRef.current.videoHeight || 720;
      const outputCtx = outputCanvas.getContext('2d', { willReadFrequently: true });

      if (!outputCtx) {
        throw new Error('Could not get canvas context');
      }

      const mediaStream = outputCanvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: 'video/webm;codecs=vp8,opus',
        videoBitsPerSecond: 5000000 // Increased to 5 Mbps for better quality
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      // Load watermark image if present
      let watermarkImg: HTMLImageElement | null = null;
      if (watermark) {
        watermarkImg = new Image();
        watermarkImg.crossOrigin = "anonymous";
        await new Promise((resolve, reject) => {
          watermarkImg!.onload = resolve;
          watermarkImg!.onerror = reject;
          watermarkImg!.src = watermark.image;
        });
      }

      return new Promise((resolve, reject) => {
        mediaRecorder.onstop = () => {
          try {
            const finalBlob = new Blob(chunks, { type: 'video/webm' });
            setIsProcessing(false);
            resolve(finalBlob);
          } catch (error) {
            reject(error);
          }
        };

        const processFrame = async () => {
          if (!videoRef.current || !outputCtx) return;

          const currentTime = videoRef.current.currentTime;
          if (!isFinite(currentTime)) {
            console.error('Invalid currentTime:', currentTime);
            return;
          }

          const progress = (currentTime - startTime) / (endTime - startTime);

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
            }
          } else {
            mediaRecorder.stop();
          }
        };

        mediaRecorder.start();
        videoRef.current.currentTime = startTime;
        videoRef.current.onseeked = () => {
          processFrame().catch(reject);
        };
      });

    } catch (error) {
      console.error('Video processing error:', error);
      setIsProcessing(false);
      toast({
        variant: "destructive",
        title: "Processing failed",
        description: "There was an error processing your video. Please try again."
      });
      throw error;
    }
  };

  return {
    isProcessing,
    processVideo
  };
};