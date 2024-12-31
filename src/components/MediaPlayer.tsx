import React, { useRef } from 'react';
import { VideoEditor } from './VideoEditor';
import { TimestampControls } from './video/TimestampControls';
import { TranscriptionControls } from './video/TranscriptionControls';
import { SummaryControls } from './video/SummaryControls';

interface MediaPlayerProps {
  recordedBlob: Blob | null;
}

export const MediaPlayer = ({ recordedBlob }: MediaPlayerProps) => {
  const [editedBlob, setEditedBlob] = React.useState<Blob | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentBlob = editedBlob || recordedBlob;

  if (!currentBlob) return null;

  const videoUrl = URL.createObjectURL(currentBlob);

  const seekToTimestamp = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  return (
    <div className="mt-6 w-full">
      <h3 className="text-lg font-semibold mb-2 text-white">Recording Preview</h3>
      <div className="space-y-4">
        <video 
          ref={videoRef}
          src={videoUrl}
          controls
          className="w-full rounded-lg bg-black"
          onEnded={() => URL.revokeObjectURL(videoUrl)}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TimestampControls 
            videoRef={videoRef}
            onSeek={seekToTimestamp}
          />
          <TranscriptionControls 
            videoRef={videoRef}
            onSeek={seekToTimestamp}
          />
          <SummaryControls 
            videoRef={videoRef}
          />
        </div>
      </div>

      <VideoEditor 
        recordedBlob={currentBlob} 
        onSave={setEditedBlob}
      />
    </div>
  );
};