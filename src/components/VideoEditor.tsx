import React, { useRef, useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { ShareControls } from './video/ShareControls';
import { EmbedControls } from './video/EmbedControls';
import { ExportControls } from './video/ExportControls';
import { SilenceControls } from './video/SilenceControls';
import { FillerWordControls } from './video/FillerWordControls';
import { useVideoProcessing } from '@/hooks/useVideoProcessing';

interface VideoEditorProps {
  recordedBlob: Blob | null;
  timestamps: Array<{ time: number; label: string }>;
  onSave: (newBlob: Blob) => void;
}

export const VideoEditor = ({ recordedBlob, timestamps, onSave }: VideoEditorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [removeSilences, setRemoveSilences] = useState(false);
  const [removeFillerWords, setRemoveFillerWords] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      setVideoUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [recordedBlob]);

  const handleMetadataLoaded = (videoDuration: number) => {
    setDuration(videoDuration);
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  if (!recordedBlob) return null;

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto">
      <div className="relative rounded-lg overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full"
          controls
          playsInline
          onTimeUpdate={(e) => handleTimeUpdate(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => handleMetadataLoaded(e.currentTarget.duration)}
          autoPlay={false}
          muted={false}
        />
      </div>

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