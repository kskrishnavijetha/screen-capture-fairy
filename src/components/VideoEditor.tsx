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
      if (!recordedBlob) return;

      try {
        setIsLoading(true);
        url = createVideoUrl(recordedBlob);
        
        if (!url) {
          throw new Error('Failed to create video URL');
        }

        if (!videoRef.current) {
          throw new Error('Video element not found');
        }

        const validatedUrl = validateVideoUrl(url);
        if (!validatedUrl) {
          throw new Error('Invalid video URL');
        }

        videoRef.current.src = validatedUrl;
        setVideoUrl(validatedUrl);

        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) return reject(new Error('Video element not found'));
          
          const handleLoad = () => {
            videoRef.current?.removeEventListener('loadedmetadata', handleLoad);
            resolve();
          };

          const handleError = (error: Event) => {
            reject(new Error(`Failed to load video: ${error.type}`));
          };

          videoRef.current.addEventListener('loadedmetadata', handleLoad);
          videoRef.current.addEventListener('error', handleError, { once: true });

          setTimeout(() => reject(new Error('Video loading timed out')), 30000);
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
        cleanupVideoUrl(url);
      }
    };
  }, [recordedBlob]);

  if (!recordedBlob) return null;

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto mt-6">
      {isLoading ? (
        <div className="flex items-center justify-center p-8 bg-gray-100 rounded-lg">
          <p className="text-gray-600">Loading video, please wait...</p>
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