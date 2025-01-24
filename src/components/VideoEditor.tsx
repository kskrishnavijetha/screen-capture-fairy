import React, { useRef, useState } from 'react';
import { ShareControls } from './video/ShareControls';
import { EmbedControls } from './video/EmbedControls';
import { ExportControls } from './video/ExportControls';
import { SilenceControls } from './video/SilenceControls';
import { FillerWordControls } from './video/FillerWordControls';
import { VideoPreviewSection } from './video/preview/VideoPreviewSection';

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
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const [removeSilences, setRemoveSilences] = useState(false);
  const [removeFillerWords, setRemoveFillerWords] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  React.useEffect(() => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      setVideoUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [recordedBlob]);

  React.useEffect(() => {
    return () => {
      if (processedVideoUrl) {
        URL.revokeObjectURL(processedVideoUrl);
      }
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [processedVideoUrl, videoUrl]);

  const handleMetadataLoaded = (videoDuration: number) => {
    setDuration(videoDuration);
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  if (!recordedBlob) return null;

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto">
      <VideoPreviewSection
        videoRef={videoRef}
        previewRef={previewRef}
        videoUrl={videoUrl}
        processedVideoUrl={processedVideoUrl}
        onMetadataLoaded={handleMetadataLoaded}
        onTimeUpdate={handleTimeUpdate}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <SilenceControls
            enabled={removeSilences}
            onToggle={setRemoveSilences}
          />

          <FillerWordControls
            enabled={removeFillerWords}
            onToggle={setRemoveFillerWords}
          />

          <ShareControls recordedBlob={recordedBlob} />
          <EmbedControls recordedBlob={recordedBlob} />
          <ExportControls recordedBlob={recordedBlob} />
        </div>
      </div>
    </div>
  );
};