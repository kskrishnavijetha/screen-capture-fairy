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
      // Calculate time range
      const startTime = Math.max(0, (trimRange[0] / 100) * duration);
      const endTime = Math.min(duration, (trimRange[1] / 100) * duration);

      if (!isFinite(startTime) || !isFinite(endTime)) {
        throw new Error('Invalid time range calculated');
      }

      // Create canvas for processing
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = videoRef.current.videoWidth;
      outputCanvas.height = videoRef.current.videoHeight;
      
      if (outputCanvas.width === 0 || outputCanvas.height === 0) {
        throw new Error('Invalid video dimensions');
      }

      const outputCtx = outputCanvas.getContext('2d', { 
        willReadFrequently: true,
        alpha: false 
      });

      if (!outputCtx) {
        throw new Error('Failed to get canvas context');
      }

      // Setup media recorder with high quality settings
      const mediaStream = outputCanvas.captureStream(60); // Increased to 60fps
      const mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: 'video/webm;codecs=vp8,opus',
        videoBitsPerSecond: 8000000 // 8 Mbps for high quality
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
            const finalBlob = new Blob(chunks, { 
              type: 'video/webm;codecs=vp8,opus' 
            });
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

          try {
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
              const nextTime = currentTime + (1/60); // Process at 60fps
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

        mediaRecorder.start(1000); // Capture chunks every second
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