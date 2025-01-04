import React, { useRef, useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { BlurControls } from './video/BlurControls';
import { TrimControls } from './video/TrimControls';
import { CaptionControls } from './video/CaptionControls';
import { ShareControls } from './video/ShareControls';
import { EmbedControls } from './video/EmbedControls';
import { ExportControls } from './video/ExportControls';
import { ProcessControls } from './video/ProcessControls';
import { AnnotationControls } from './video/AnnotationControls';
import { WatermarkControls } from './video/WatermarkControls';
import { VideoPreviewSection } from './video/VideoPreviewSection';
import { TransitionSelector } from './video/TransitionSelector';
import { useVideoProcessing } from '@/hooks/useVideoProcessing';

interface VideoEditorProps {
  recordedBlob: Blob | null;
  timestamps: Array<{ time: number; label: string }>;
  onSave: (newBlob: Blob) => void;
}

export const VideoEditor = ({ recordedBlob, timestamps, onSave }: VideoEditorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [trimRange, setTrimRange] = useState([0, 100]);
  const [blurRegions, setBlurRegions] = useState<Array<{ x: number, y: number, width: number, height: number }>>([]);
  const [captions, setCaptions] = useState<Array<{ startTime: number; endTime: number; text: string }>>([]);
  const [annotations, setAnnotations] = useState<Array<{ id: string; timestamp: number; text: string; author: string }>>([]);
  const [transitionType, setTransitionType] = useState<'none' | 'fade' | 'crossfade'>('none');
  const [watermark, setWatermark] = useState<any>(null);
  const [isMetadataLoaded, setIsMetadataLoaded] = useState(false);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const { isProcessing, processVideo } = useVideoProcessing();

  useEffect(() => {
    let videoUrl: string | null = null;
    
    const setupVideo = async () => {
      if (videoRef.current && recordedBlob) {
        // Create new URL for the video
        videoUrl = URL.createObjectURL(recordedBlob);
        videoRef.current.src = videoUrl;
        
        // Wait for metadata to load
        if (videoRef.current.readyState < 1) {
          await new Promise<void>((resolve) => {
            const handleLoad = () => {
              videoRef.current?.removeEventListener('loadedmetadata', handleLoad);
              resolve();
            };
            videoRef.current?.addEventListener('loadedmetadata', handleLoad);
          });
        }
        
        // Set duration and metadata loaded flag
        if (isFinite(videoRef.current.duration)) {
          setDuration(videoRef.current.duration);
          setIsMetadataLoaded(true);
          console.log('Video metadata loaded successfully:', {
            duration: videoRef.current.duration,
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight
          });
        }
      }
    };

    setupVideo();

    // Cleanup
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [recordedBlob]);

  useEffect(() => {
    return () => {
      if (processedVideoUrl) {
        URL.revokeObjectURL(processedVideoUrl);
      }
    };
  }, [processedVideoUrl]);

  const handleTrimRangeChange = (newRange: number[]) => {
    setTrimRange(newRange);
    if (videoRef.current && duration > 0) {
      const newTime = (newRange[0] / 100) * duration;
      videoRef.current.currentTime = newTime;
    }
  };

  const handleProcess = async () => {
    if (!recordedBlob) {
      toast({
        title: "Error",
        description: "No video to process",
        variant: "destructive",
      });
      return;
    }

    if (!isMetadataLoaded || !isFinite(duration) || duration <= 0) {
      toast({
        title: "Error",
        description: "Please wait for video to load completely",
        variant: "destructive",
      });
      return;
    }

    try {
      const processedBlob = await processVideo({
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
      });

      if (processedVideoUrl) {
        URL.revokeObjectURL(processedVideoUrl);
      }
      const newUrl = URL.createObjectURL(processedBlob);
      setProcessedVideoUrl(newUrl);
      
      onSave(processedBlob);
      toast({
        title: "Success",
        description: "Video processing completed",
      });
    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: "Error processing video",
        description: error instanceof Error ? error.message : "Processing failed",
        variant: "destructive",
      });
    }
  };

  if (!recordedBlob) return null;

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto mt-6">
      <VideoPreviewSection
        videoRef={videoRef}
        processedVideoUrl={processedVideoUrl}
        blurRegions={blurRegions}
        setBlurRegions={setBlurRegions}
      />

      <TransitionSelector
        value={transitionType}
        onChange={setTransitionType}
      />

      <TrimControls
        duration={duration}
        trimRange={trimRange}
        onTrimRangeChange={handleTrimRangeChange}
      />

      <CaptionControls
        duration={duration}
        captions={captions}
        onCaptionsChange={setCaptions}
      />

      <AnnotationControls
        duration={duration}
        annotations={annotations}
        onAnnotationsChange={setAnnotations}
      />

      <WatermarkControls
        watermark={watermark}
        onWatermarkChange={setWatermark}
      />

      <ShareControls recordedBlob={recordedBlob} />
      <EmbedControls recordedBlob={recordedBlob} />
      <ExportControls recordedBlob={recordedBlob} />

      <ProcessControls 
        onProcess={handleProcess} 
        isProcessing={isProcessing}
      />
    </div>
  );
};