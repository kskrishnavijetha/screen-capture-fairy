import React from 'react';
import { CommentSection } from './video/CommentSection';

interface MediaPlayerProps {
  recordedBlob: Blob;
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({ recordedBlob }) => {
  return (
    <div className="space-y-4">
      <video
        src={URL.createObjectURL(recordedBlob)}
        controls
        className="w-full rounded-lg bg-black"
        onEnded={() => URL.revokeObjectURL(URL.createObjectURL(recordedBlob))}
      />
      <CommentSection videoId={recordedBlob.size.toString()} />
    </div>
  );
};