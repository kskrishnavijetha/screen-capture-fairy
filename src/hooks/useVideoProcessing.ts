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
      // Ensure duration is valid
      if (!duration || duration <= 0) {
        duration = videoRef.current.duration;
      }

      // Validate and normalize trim range
      const normalizedTrimRange = trimRange.map(value => Math.max(0, Math.min(100, value)));
      const startTime = (normalizedTrimRange[0] / 100) * duration;
      const endTime = (normalizedTrimRange[1] / 100) * duration;

      // Validate time range
      if (!isFinite(startTime) || !isFinite(endTime) || startTime >= endTime) {
        throw new Error('Invalid time range');
      }

      // Create canvas for processing
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = videoRef.current.videoWidth || 1280; // Fallback width
      outputCanvas.height = videoRef.current.videoHeight || 720; // Fallback height
      
      const outputCtx = outputCanvas.getContext('2d', { 
        willReadFrequently: true,
        alpha: false 
      });

      if (!outputCtx) {
        throw new Error('Failed to get canvas context');
      }

      // Setup media recorder with high quality settings
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
            const finalBlob = new Blob(chunks, { 
              type: 'video/webm;codecs=vp8,opus' 
            });
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

        mediaRecorder.start(1000);
        videoRef.current.currentTime = startTime;
        
        videoRef.current.onseeked = () => {
          processFrame();
        };
      });

    } catch (error) {
      console.error('Video processing error:', error);
      setIsProcessing(false);
      toast({
        variant: "destructive",
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Failed to process video"
      });
      throw error;
    }
  };

  return {
    isProcessing,
    processVideo
  };
};