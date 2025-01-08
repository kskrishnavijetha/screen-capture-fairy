import React, { useRef, useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { BlurControls } from './video/BlurControls';
import { TrimControls } from './video/TrimControls';
import { ShareControls } from './video/ShareControls';
import { EmbedControls } from './video/EmbedControls';
import { ExportControls } from './video/ExportControls';
import { ProcessControls } from './video/ProcessControls';
import { WatermarkControls } from './video/WatermarkControls';
import { SilenceControls } from './video/SilenceControls';
import { FillerWordControls } from './video/FillerWordControls';
import { VideoPreviewSection } from './video/VideoPreviewSection';
import { useVideoProcessing } from '@/hooks/useVideoProcessing';

interface VideoEditorProps {
  recordedBlob: Blob | null;
  timestamps: Array<{ time: number; label: string }>;
  onSave: (newBlob: Blob) => void;
}

export const VideoEditor = ({ recordedBlob, timestamps, onSave }: VideoEditorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [trimRange, setTrimRange] = useState([0, 100]);
  const [blurRegions, setBlurRegions] = useState<Array<{ x: number, y: number, width: number, height: number }>>([]);
  const [watermark, setWatermark] = useState<any>(null);
  const [isMetadataLoaded, setIsMetadataLoaded] = useState(false);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const [removeSilences, setRemoveSilences] = useState(false);
  const [removeFillerWords, setRemoveFillerWords] = useState(false);
  const { isProcessing, processVideo } = useVideoProcessing();

  useEffect(() => {
    if (videoRef.current && recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      videoRef.current.src = url;
      
      const handleMetadataLoaded = () => {
        if (videoRef.current) {
          const videoDuration = videoRef.current.duration;
          if (isNaN(videoDuration) || !isFinite(videoDuration)) {
            toast({
              title: "Error",
              description: "Invalid video duration. Please try a different video file.",
              variant: "destructive"
            });
            return;
          }
          setDuration(videoDuration);
          setIsMetadataLoaded(true);
          console.log('Video metadata loaded:', {
            duration: videoDuration,
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight
          });
        }
      };

      videoRef.current.addEventListener('loadedmetadata', handleMetadataLoaded);

      return () => {
        URL.revokeObjectURL(url);
        if (videoRef.current) {
          videoRef.current.removeEventListener('loadedmetadata', handleMetadataLoaded);
        }
      };
    }
  }, [recordedBlob]);

  useEffect(() => {
    return () => {
      if (processedVideoUrl) {
        URL.revokeObjectURL(processedVideoUrl);
      }
    };
  }, [processedVideoUrl]);

  const handleTrimRangeChange = (newRange: number[]) => {
    if (!isMetadataLoaded) return;
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

    if (!isMetadataLoaded) {
      toast({
        title: "Error",
        description: "Please wait for video to load completely",
        variant: "destructive",
      });
      return;
    }

    try {
      const startTime = (trimRange[0] / 100) * duration;
      const endTime = (trimRange[1] / 100) * duration;

      if (isNaN(startTime) || isNaN(endTime) || !isFinite(startTime) || !isFinite(endTime)) {
        toast({
          title: "Error",
          description: "Invalid trim range values",
          variant: "destructive",
        });
        return;
      }

      console.log('Processing video with trim range:', { startTime, endTime, duration });

      const processedBlob = await processVideo({
        recordedBlob,
        videoRef,
        blurRegions,
        watermark,
        timestamps,
        trimRange: [startTime, endTime],
        duration,
        removeSilences,
        removeFillerWords
      });

      if (processedVideoUrl) {
        URL.revokeObjectURL(processedVideoUrl);
      }
      const newUrl = URL.createObjectURL(processedBlob);
      setProcessedVideoUrl(newUrl);
      
      onSave(processedBlob);
      toast({
        title: "Success",
        description: "Video processing completed. Preview is now available.",
      });
    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: "Error processing video",
        description: error instanceof Error ? error.message : "There was an error while processing your video. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!recordedBlob) return null;

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto mt-6">
      <VideoPreviewSection
        videoRef={videoRef}
        previewRef={previewRef}
        processedVideoUrl={processedVideoUrl}
        blurRegions={blurRegions}
        setBlurRegions={setBlurRegions}
      />

      <div className="space-y-4">
        <TrimControls
          duration={duration}
          trimRange={trimRange}
          onTrimRangeChange={handleTrimRangeChange}
          videoRef={videoRef}
        />

        <SilenceControls
          enabled={removeSilences}
          onToggle={setRemoveSilences}
        />

        <FillerWordControls
          enabled={removeFillerWords}
          onToggle={setRemoveFillerWords}
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
    </div>
  );
};