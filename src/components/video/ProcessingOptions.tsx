import React from 'react';
import { ShareControls } from './ShareControls';
import { EmbedControls } from './EmbedControls';
import { ExportControls } from './ExportControls';
import { ProcessControls } from './ProcessControls';

interface ProcessingOptionsProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  timestamps: Array<{ time: number; label: string }>;
  isMetadataLoaded: boolean;
  isProcessing: boolean;
  onSave: (blob: Blob) => void;
  processVideo: Function;
}

export const ProcessingOptions = ({
  videoRef,
  timestamps,
  isMetadataLoaded,
  isProcessing,
  onSave,
  processVideo
}: ProcessingOptionsProps) => {
  if (!isMetadataLoaded) return null;

  return (
    <div className="space-y-4">
      <ShareControls recordedBlob={videoRef.current?.src} />
      <EmbedControls recordedBlob={videoRef.current?.src} />
      <ExportControls recordedBlob={videoRef.current?.src} />
      <ProcessControls 
        onProcess={() => processVideo({
          videoRef,
          timestamps,
          onSave
        })}
        isProcessing={isProcessing}
      />
    </div>
  );
};