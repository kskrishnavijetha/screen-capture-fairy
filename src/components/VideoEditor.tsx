import React, { useRef, useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { ShareControls } from './video/ShareControls';
import { EmbedControls } from './video/EmbedControls';
import { ExportControls } from './video/ExportControls';
import { SilenceControls } from './video/SilenceControls';
import { FillerWordControls } from './video/FillerWordControls';
import { EmotionDetection } from './video/EmotionDetection';
import { useVideoProcessing } from '@/hooks/useVideoProcessing';
import { Separator } from './ui/separator';
import { Card } from './ui/card';

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

  const handleHighlightClick = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  if (!recordedBlob) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Video Preview */}
      <div className="space-y-6">
        <Card className="p-4">
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full"
              controls
              playsInline
              onTimeUpdate={(e) => handleTimeUpdate(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => handleMetadataLoaded(e.currentTarget.duration)}
              autoPlay={false}
              muted={false}
            />
          </div>
        </Card>
        
        <EmotionDetection
          videoId={videoUrl || ''}
          currentTime={currentTime}
          onHighlightClick={handleHighlightClick}
        />
      </div>

      {/* Controls */}
      <div className="space-y-6">
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Video Enhancement</h3>
            <div className="space-y-4">
              <SilenceControls
                enabled={removeSilences}
                onToggle={setRemoveSilences}
              />
              <FillerWordControls
                enabled={removeFillerWords}
                onToggle={setRemoveFillerWords}
              />
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4">Share & Export</h3>
            <div className="space-y-4">
              <ShareControls recordedBlob={recordedBlob} />
              <EmbedControls recordedBlob={recordedBlob} />
              <ExportControls recordedBlob={recordedBlob} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};