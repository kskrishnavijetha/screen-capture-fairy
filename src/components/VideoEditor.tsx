import React, { useRef, useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { ShareControls } from './video/ShareControls';
import { EmbedControls } from './video/EmbedControls';
import { ExportControls } from './video/ExportControls';
import { WatermarkControls } from './video/WatermarkControls';
import { SilenceControls } from './video/SilenceControls';
import { FillerWordControls } from './video/FillerWordControls';
import { VideoPreviewSection } from './video/preview/VideoPreviewSection';
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
  const [currentTime, setCurrentTime] = useState(0);
  const [watermark, setWatermark] = useState<any>(null);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const [removeSilences, setRemoveSilences] = useState(false);
  const [removeFillerWords, setRemoveFillerWords] = useState(false);

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
        watermark={watermark}
      />

      <div className="space-y-4">
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