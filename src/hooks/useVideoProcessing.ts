import { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { validateVideoMetadata, validateTimeRange } from '../utils/videoValidation';
import { setupCanvas, createMediaRecorder } from '../utils/frameProcessing';
import { processVideoFrame } from '../components/video/VideoProcessing';

interface ProcessingOptions {
  recordedBlob: Blob;
  videoRef: React.RefObject<HTMLVideoElement>;
  transitionType: 'none' | 'fade' | 'crossfade';
  blurRegions: Array<{ x: number; y: number; width: number; height: number }>;
  captions: Array<{ startTime: number; endTime: number; text: string }>;
  annotations: Array<{ id: string; timestamp: number; text: string; author: string }>;
  watermark: any;
  timestamps: Array<{ time: number; label: string }>;
  trimRange: number[];
  duration: number;
}

export const useVideoProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const waitForMetadata = async (video: HTMLVideoElement): Promise<void> => {
    if (video.readyState >= 2) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error('Video metadata loading timed out'));
      }, 30000); // 30 second timeout

      const loadHandler = () => {
        cleanup();
        resolve();
      };

      const errorHandler = (error: Event) => {
        cleanup();
        reject(new Error('Error loading video metadata: ' + error.type));
      };

      const cleanup = () => {
        clearTimeout(timeoutId);
        video.removeEventListener('loadeddata', loadHandler);
        video.removeEventListener('error', errorHandler);
      };

      video.addEventListener('loadeddata', loadHandler);
      video.addEventListener('error', errorHandler);
    });
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
    duration
  }: ProcessingOptions): Promise<Blob> => {
    if (!recordedBlob) {
      throw new Error('No video to process');
    }

    if (!videoRef.current) {
      throw new Error('Video element not found');
    }

    setIsProcessing(true);
    console.log('Starting video processing...', {
      blobSize: recordedBlob.size,
      blobType: recordedBlob.type,
      videoRef: !!videoRef.current,
      trimRange,
      duration
    });

    try {
      // Ensure video metadata is loaded
      await waitForMetadata(videoRef.current);
      console.log('Video metadata loaded successfully');

      // Validate video metadata
      const metadata = validateVideoMetadata(videoRef.current);
      console.log('Video metadata validated:', metadata);

      // Calculate and validate time range
      const timeRange = validateTimeRange(
        (trimRange[0] / 100) * metadata.duration,
        (trimRange[1] / 100) * metadata.duration,
        metadata.duration
      );
      console.log('Time range validated:', timeRange);

      // Setup canvas and media recorder
      const { canvas, ctx } = setupCanvas(metadata.width, metadata.height);
      console.log('Canvas setup complete:', { width: canvas.width, height: canvas.height });

      const chunks: Blob[] = [];
      const mediaRecorder = createMediaRecorder(canvas, (e) => {
        if (e.data && e.data.size > 0) {
          console.log('Received data chunk:', e.data.size);
          chunks.push(e.data);
        }
      });

      return new Promise((resolve, reject) => {
        mediaRecorder.onstop = () => {
          try {
            console.log('MediaRecorder stopped, creating final blob...');
            const finalBlob = new Blob(chunks, { type: 'video/webm' });
            console.log('Final blob created:', { size: finalBlob.size, type: finalBlob.type });
            setIsProcessing(false);
            resolve(finalBlob);
          } catch (error) {
            console.error('Error creating final blob:', error);
            reject(error);
          }
        };

        const processFrame = () => {
          if (!videoRef.current || !ctx) return;

          const currentTime = videoRef.current.currentTime;
          const progress = (currentTime - timeRange.start) / (timeRange.end - timeRange.start);
          
          try {
            processVideoFrame({
              videoRef,
              transitionType,
              blurRegions,
              captions,
              annotations,
              watermark,
              timestamps,
              trimRange: [timeRange.start, timeRange.end]
            }, ctx, progress);

            if (currentTime < timeRange.end) {
              videoRef.current.currentTime = Math.min(
                currentTime + (1/60),
                timeRange.end
              );
              requestAnimationFrame(processFrame);
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
          console.log('Starting MediaRecorder...');
          mediaRecorder.start();
          videoRef.current.currentTime = timeRange.start;
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
      toast({
        title: "Error processing video",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    isProcessing,
    processVideo
  };
};