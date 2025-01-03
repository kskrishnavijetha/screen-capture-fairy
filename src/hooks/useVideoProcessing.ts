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

  const validateTimeRange = (startPercent: number, endPercent: number, duration: number) => {
    // Ensure percentages are valid numbers between 0-100
    if (isNaN(startPercent) || isNaN(endPercent)) {
      throw new Error('Invalid trim range values');
    }

    const start = (Math.max(0, Math.min(100, startPercent)) / 100) * duration;
    const end = (Math.max(0, Math.min(100, endPercent)) / 100) * duration;

    if (!isFinite(start) || !isFinite(end)) {
      throw new Error('Invalid time calculations');
    }

    if (start >= end) {
      throw new Error('Start time must be before end time');
    }

    if (start < 0 || end > duration) {
      throw new Error('Time range exceeds video duration');
    }

    return { start, end };
  };

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
  }: ProcessingOptions): Promise<Blob> => {
    if (!videoRef.current || !recordedBlob) {
      throw new Error('Invalid video reference or blob data');
    }

    setIsProcessing(true);
    console.log('Starting video processing...');
    
    try {
      // Wait for video metadata to load
      if (!videoRef.current.duration) {
        await new Promise<void>((resolve) => {
          videoRef.current!.onloadedmetadata = () => resolve();
        });
      }

      const videoDuration = videoRef.current.duration;
      console.log('Video duration:', videoDuration);

      if (!videoDuration || videoDuration <= 0) {
        throw new Error('Invalid video duration');
      }

      // Validate and calculate time range
      const { start: startTime, end: endTime } = validateTimeRange(
        trimRange[0],
        trimRange[1],
        videoDuration
      );

      console.log('Time range:', { startTime, endTime });

      // Setup canvas
      const outputCanvas = document.createElement('canvas');
      const videoWidth = videoRef.current.videoWidth || 1280;
      const videoHeight = videoRef.current.videoHeight || 720;

      console.log('Video dimensions:', { videoWidth, videoHeight });
      
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
          console.log('Processing frame at time:', currentTime, 'progress:', progress);

          try {
            processVideoFrame({
              videoRef,
              transitionType,
              blurRegions,
              captions,
              annotations,
              watermark: watermark ? { ...watermark, image: watermarkImg! } : null,
              timestamps,
              trimRange: [startTime, endTime]
            }, outputCtx, progress);

            if (currentTime < endTime) {
              const nextTime = currentTime + (1/60);
              if (isFinite(nextTime) && nextTime <= endTime) {
                videoRef.current.currentTime = nextTime;
                requestAnimationFrame(processFrame);
              } else {
                console.log('Finished processing at time:', currentTime);
                mediaRecorder.stop();
              }
            } else {
              console.log('Reached end time:', endTime);
              mediaRecorder.stop();
            }
          } catch (error) {
            console.error('Frame processing error:', error);
            mediaRecorder.stop();
            reject(error);
          }
        };

        try {
          console.log('Starting media recorder and seeking to:', startTime);
          mediaRecorder.start();
          videoRef.current.currentTime = startTime;
          videoRef.current.onseeked = () => {
            console.log('Video seeked to start time, beginning processing');
            processFrame();
          };
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