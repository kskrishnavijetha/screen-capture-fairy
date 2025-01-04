import React, { useRef, useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { validateVideoUrl, createVideoUrl, cleanupVideoUrl } from './video/VideoUrlHandler';
import { VideoControls } from './video/VideoControls';
import { ProcessingOptions } from './video/ProcessingOptions';
import { useVideoProcessing } from '@/hooks/useVideoProcessing';

interface VideoEditorProps {
  recordedBlob: Blob | null;
  timestamps: Array<{ time: number; label: string }>;
  onSave: (newBlob: Blob) => void;
}

export const VideoEditor = ({ recordedBlob, timestamps, onSave }: VideoEditorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMetadataLoaded, setIsMetadataLoaded] = useState(false);
  const { isProcessing, processVideo } = useVideoProcessing();

  useEffect(() => {
    let url: string | null = null;
    
    const setupVideo = async () => {
      if (!recordedBlob) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        url = URL.createObjectURL(recordedBlob);
        
        if (!url) {
          throw new Error('Failed to create video URL');
        }

        // Wait for next render cycle to ensure video element exists
        await new Promise(resolve => setTimeout(resolve, 0));

        if (!videoRef.current) {
          throw new Error('Video element not found');
        }

        videoRef.current.src = url;
        setVideoUrl(url);

        // Wait for metadata to load
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video element not found'));
            return;
          }
          
          const handleLoad = () => {
            videoRef.current?.removeEventListener('loadedmetadata', handleLoad);
            resolve();
          };

          const handleError = (error: Event) => {
            reject(new Error(`Failed to load video: ${error.type}`));
          };

          videoRef.current.addEventListener('loadedmetadata', handleLoad);
          videoRef.current.addEventListener('error', handleError, { once: true });
        });

        if (!videoRef.current || !isFinite(videoRef.current.duration)) {
          throw new Error('Invalid video duration');
        }

        setIsMetadataLoaded(true);
        setIsLoading(false);
        console.log('Video loaded successfully:', {
          duration: videoRef.current.duration,
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight
        });

      } catch (error) {
        console.error('Error loading video:', error);
        setIsLoading(false);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load video",
          variant: "destructive",
        });
      }
    };

    setupVideo();

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [recordedBlob]);

  if (!recordedBlob) return null;

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto mt-6">
      {isLoading ? (
        <div className="flex items-center justify-center p-8 bg-gray-800 rounded-lg">
          <p className="text-gray-200">Loading video, please wait...</p>
        </div>
      ) : (
        <>
          <VideoControls
            videoRef={videoRef}
            videoUrl={videoUrl}
            isMetadataLoaded={isMetadataLoaded}
          />
          <ProcessingOptions
            videoRef={videoRef}
            timestamps={timestamps}
            isMetadataLoaded={isMetadataLoaded}
            isProcessing={isProcessing}
            onSave={onSave}
            processVideo={processVideo}
          />
        </>
      )}
    </div>
  );
};