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
      console.error('No video blob provided');
      throw new Error('No video to process');
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
      // Wait for video metadata to load
      if (!videoRef.current?.duration || !isFinite(videoRef.current.duration)) {
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video element not found'));
            return;
          }

          const timeout = setTimeout(() => {
            reject(new Error('Timeout waiting for video metadata'));
          }, 10000); // 10 second timeout

          videoRef.current.onloadedmetadata = () => {
            clearTimeout(timeout);
            console.log('Video metadata loaded:', {
              duration: videoRef.current?.duration,
              width: videoRef.current?.videoWidth,
              height: videoRef.current?.videoHeight
            });
            resolve();
          };
        });
      }

      if (!videoRef.current?.duration || !isFinite(videoRef.current.duration)) {
        throw new Error('Video metadata still not available after waiting');
      }

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
          if (!videoRef.current || !ctx) {
            console.error('Missing video element or context in processFrame');
            return;
          }

          const currentTime = videoRef.current.currentTime;
          if (!isFinite(currentTime)) {
            console.error('Invalid currentTime:', currentTime);
            return;
          }

          const progress = (currentTime - timeRange.start) / (timeRange.end - timeRange.start);
          console.log('Processing frame:', { currentTime, progress });
          
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
              const nextTime = currentTime + (1/60);
              if (isFinite(nextTime) && nextTime <= timeRange.end) {
                videoRef.current.currentTime = nextTime;
                requestAnimationFrame(processFrame);
              } else {
                console.log('Reached end of processing, stopping...');
                mediaRecorder.stop();
              }
            } else {
              console.log('Processing complete, stopping recorder...');
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
          if (videoRef.current) {
            console.log('Seeking to start time:', timeRange.start);
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