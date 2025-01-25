import React from 'react';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';
import { formatTime } from '@/utils/timeUtils';

interface VideoPreviewProps {
  videoUrl: string;
  videoRef: React.RefObject<HTMLVideoElement>;
  onAddTimestamp: () => void;
  onStartTranscription: () => void;
  isTranscribing: boolean;
  onDownload?: () => void;
}

export const VideoPreview = ({
  videoUrl,
  videoRef,
  onAddTimestamp,
  onStartTranscription,
  isTranscribing,
  onDownload
}: VideoPreviewProps) => {
  return (
    <div className="space-y-4">
      <div className="max-w-sm mx-auto">
        <video 
          ref={videoRef}
          src={videoUrl}
          controls
          className="w-full rounded-lg bg-black"
          onEnded={() => URL.revokeObjectURL(videoUrl)}
        />
      </div>
      
      <div className="flex justify-between items-center gap-2">
        <Button 
          onClick={onAddTimestamp}
          variant="secondary"
          className="flex items-center gap-2"
        >
          Add Timestamp
        </Button>
        <Button
          onClick={onStartTranscription}
          variant="secondary"
          disabled={isTranscribing}
          className="flex items-center gap-2"
        >
          {isTranscribing ? 'Transcribing...' : 'Start Transcription'}
        </Button>
      </div>

      {onDownload && (
        <Button
          onClick={onDownload}
          className="w-full flex items-center justify-center gap-2"
          variant="default"
        >
          <Download className="h-4 w-4" />
          Download Edited Video
        </Button>
      )}
    </div>
  );
};