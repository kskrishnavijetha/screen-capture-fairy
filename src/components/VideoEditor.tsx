import React, { useRef, useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { ShareControls } from './video/ShareControls';
import { EmbedControls } from './video/EmbedControls';
import { ExportControls } from './video/ExportControls';
import { WatermarkControls } from './video/WatermarkControls';
import { SilenceControls } from './video/SilenceControls';
import { FillerWordControls } from './video/FillerWordControls';
import { VideoPreviewSection } from './video/preview/VideoPreviewSection';
import { TrimControls } from './video/TrimControls';
import { useVideoProcessing } from '@/hooks/useVideoProcessing';
import { Button } from './ui/button';

interface VideoEditorProps {
  recordedBlob: Blob | null;
  timestamps: Array<{ time: number; label: string }>;
  onSave: (newBlob: Blob) => void;
}

export const VideoEditor = ({ recordedBlob, timestamps, onSave }: VideoEditorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [watermark, setWatermark] = useState<any>(null);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const [removeSilences, setRemoveSilences] = useState(false);
  const [removeFillerWords, setRemoveFillerWords] = useState(false);
  const [trimRange, setTrimRange] = useState([0, 100]);

  const { trimVideo, isProcessing, progress } = useVideoProcessing();

  useEffect(() => {
    return () => {
      if (processedVideoUrl) {
        URL.revokeObjectURL(processedVideoUrl);
      }
    };
  }, [processedVideoUrl]);

  const handleMetadataLoaded = (videoDuration: number) => {
    setDuration(videoDuration);
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleTrimRangeChange = (newRange: number[]) => {
    setTrimRange(newRange);
  };

  const handleTrimVideo = async () => {
    if (!recordedBlob || !duration) return;

    const startTime = (trimRange[0] / 100) * duration;
    const endTime = (trimRange[1] / 100) * duration;

    const trimmedBlob = await trimVideo(recordedBlob, startTime, endTime);
    
    if (trimmedBlob) {
      if (processedVideoUrl) {
        URL.revokeObjectURL(processedVideoUrl);
      }
      const newUrl = URL.createObjectURL(trimmedBlob);
      setProcessedVideoUrl(newUrl);
      onSave(trimmedBlob);
    }
  };

  if (!recordedBlob) return null;

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto mt-6">
      <VideoPreviewSection
        videoRef={videoRef}
        previewRef={previewRef}
        recordedBlob={recordedBlob}
        processedVideoUrl={processedVideoUrl}
        onMetadataLoaded={handleMetadataLoaded}
        onTimeUpdate={handleTimeUpdate}
      />

      <div className="space-y-4">
        <TrimControls
          duration={duration}
          currentTime={currentTime}
          trimRange={trimRange}
          onTrimRangeChange={handleTrimRangeChange}
          videoRef={videoRef}
        />

        <Button 
          onClick={handleTrimVideo}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? `Processing... ${progress}%` : 'Trim Video'}
        </Button>

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
      </div>
    </div>
  );
};