import React from 'react';
import { VideoEditor } from './VideoEditor';

interface MediaPlayerProps {
  recordedBlob: Blob | null;
}

export const MediaPlayer = ({ recordedBlob }: MediaPlayerProps) => {
  const [editedBlob, setEditedBlob] = React.useState<Blob | null>(null);
  const currentBlob = editedBlob || recordedBlob;

  if (!currentBlob) return null;

  const videoUrl = URL.createObjectURL(currentBlob);

  return (
    <div className="mt-6 w-full">
      <h3 className="text-lg font-semibold mb-2 text-white">Recording Preview</h3>
      <video 
        src={videoUrl}
        controls
        className="w-full rounded-lg bg-black"
        onEnded={() => URL.revokeObjectURL(videoUrl)}
      />
      <VideoEditor 
        recordedBlob={currentBlob} 
        onSave={setEditedBlob}
      />
    </div>
  );
};