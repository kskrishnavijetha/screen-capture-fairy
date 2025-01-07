import { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { validateVideoMetadata, validateTimeRange } from '../utils/videoValidation';
import { setupCanvas, createMediaRecorder } from '../utils/frameProcessing';
import { processVideoFrame } from '../components/video/VideoProcessing';

interface ProcessingOptions {
  recordedBlob: Blob;
  videoRef: React.RefObject<HTMLVideoElement>;
  blurRegions: Array<{ x: number; y: number; width: number; height: number }>;
  watermark: any;
  timestamps: Array<{ time: number; label: string }>;
  trimRange: number[];
  duration: number;
  removeSilences: boolean;
  removeFillerWords: boolean;
}

export const useVideoProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processVideo = async ({
    recordedBlob,
    videoRef,
    blurRegions,
    watermark,
    timestamps,
    trimRange,
    duration,
    removeSilences,
    removeFillerWords
  }: ProcessingOptions): Promise<Blob> => {
    if (!recordedBlob) {
      throw new Error('No video to process');
    }

    setIsProcessing(true);
    console.log('Starting video processing...');

    try {
      // Wait for video metadata to load
      if (!videoRef.current?.duration || !isFinite(videoRef.current.duration)) {
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              console.log('Video metadata loaded:', {
                duration: videoRef.current?.duration,
                width: videoRef.current?.videoWidth,
                height: videoRef.current?.videoHeight
              });
              resolve();
            };
          }
        });
      }

      // Double check metadata after waiting
      if (!videoRef.current?.duration || !isFinite(videoRef.current.duration)) {
        throw new Error('Video metadata still not available after waiting');
      }

      // Validate video metadata
      const metadata = validateVideoMetadata(videoRef.current);
      console.log('Video metadata:', metadata);

      // Calculate and validate time range
      const timeRange = validateTimeRange(
        (trimRange[0] / 100) * metadata.duration,
        (trimRange[1] / 100) * metadata.duration,
        metadata.duration
      );
      console.log('Time range:', timeRange);

      // Setup canvas and media recorder
      const { canvas, ctx } = setupCanvas(metadata.width, metadata.height);
      const chunks: Blob[] = [];
      const mediaRecorder = createMediaRecorder(canvas, (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      });

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
          if (!videoRef.current || !ctx) return;

          const currentTime = videoRef.current.currentTime;
          if (!isFinite(currentTime)) {
            console.error('Invalid currentTime:', currentTime);
            return;
          }

          const progress = (currentTime - timeRange.start) / (timeRange.end - timeRange.start);
          
          try {
            processVideoFrame({
              videoRef,
              blurRegions,
              watermark,
              timestamps,
              trimRange: [timeRange.start, timeRange.end]
            }, ctx, progress);

            if (currentTime < timeRange.end) {
              const nextTime = currentTime + (1/60);
              if (isFinite(nextTime) && nextTime <= timeRange.end) {
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
          mediaRecorder.start();
          if (videoRef.current) {
            videoRef.current.currentTime = timeRange.start;
            videoRef.current.onseeked = () => {
              console.log('Video seeked to start time, beginning processing');
              processFrame();
            };
          }
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