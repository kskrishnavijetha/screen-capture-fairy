import { useState } from 'react';
import { toast } from "@/hooks/use-toast";
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
      throw new Error("Invalid input: Missing video or blob data");
    }

    setIsProcessing(true);
    
    try {
      // Get actual video duration if not provided
      const actualDuration = videoRef.current.duration || 0;
      if (actualDuration <= 0) {
        throw new Error('Invalid video duration');
      }

      // Normalize trim range to be within valid bounds
      const normalizedTrimRange = trimRange.map(value => 
        Math.max(0, Math.min(100, Number(value) || 0))
      );

      // Calculate start and end times
      const startTime = (normalizedTrimRange[0] / 100) * actualDuration;
      const endTime = (normalizedTrimRange[1] / 100) * actualDuration;

      // Validate time range
      if (!isFinite(startTime) || !isFinite(endTime)) {
        throw new Error('Invalid time values calculated');
      }

      if (startTime >= endTime) {
        throw new Error('Start time must be less than end time');
      }

      if (startTime < 0 || endTime > actualDuration) {
        throw new Error('Time range exceeds video duration');
      }

      // Create and validate canvas
      const outputCanvas = document.createElement('canvas');
      const videoWidth = videoRef.current.videoWidth || 1280;
      const videoHeight = videoRef.current.videoHeight || 720;
      
      if (videoWidth <= 0 || videoHeight <= 0) {
        throw new Error('Invalid video dimensions');
      }

      outputCanvas.width = videoWidth;
      outputCanvas.height = videoHeight;
      
      const outputCtx = outputCanvas.getContext('2d', { 
        willReadFrequently: true,
        alpha: false 
      });

      if (!outputCtx) {
        throw new Error('Failed to get canvas context');
      }

      // Setup media recorder
      const mediaStream = outputCanvas.captureStream(60);
      const mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: 'video/webm;codecs=vp8,opus',
        videoBitsPerSecond: 8000000
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      // Load watermark if present
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

        const processFrame = () => {
          if (!videoRef.current || !outputCtx) return;

          const currentTime = videoRef.current.currentTime;
          if (!isFinite(currentTime)) {
            console.error('Invalid currentTime:', currentTime);
            return;
          }

          const progress = (currentTime - startTime) / (endTime - startTime);

          try {
            processVideoFrame({
              videoRef,
              transitionType,
              blurRegions,
              captions,
              annotations,
              watermark: watermark ? { ...watermark, image: watermarkImg! } : null,
              timestamps,
              trimRange: normalizedTrimRange
            }, outputCtx, progress);

            if (currentTime < endTime) {
              const nextTime = currentTime + (1/60);
              if (isFinite(nextTime) && nextTime <= endTime) {
                videoRef.current.currentTime = nextTime;
                requestAnimationFrame(processFrame);
              } else {
                mediaRecorder.stop();
              }
            } else {
              mediaRecorder.stop();
            }
          } catch (error) {
            console.error('Frame processing error:', error);
            mediaRecorder.stop();
            reject(error);
          }
        };

        try {
          mediaRecorder.start(1000);
          videoRef.current.currentTime = startTime;
          videoRef.current.onseeked = processFrame;
        } catch (error) {
          console.error('Failed to start processing:', error);
          reject(error);
        }
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