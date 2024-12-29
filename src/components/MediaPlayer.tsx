import React from 'react';

interface MediaPlayerProps {
  recordedBlob: Blob | null;
}

export const MediaPlayer = ({ recordedBlob }: MediaPlayerProps) => {
  if (!recordedBlob) return null;

  const videoUrl = URL.createObjectURL(recordedBlob);

  return (
    <div className="mt-6 w-full">
      <h3 className="text-lg font-semibold mb-2 text-white">Recording Preview</h3>
      <video 
        src={videoUrl}
        controls
        className="w-full rounded-lg bg-black"
        onEnded={() => URL.revokeObjectURL(videoUrl)}
      />
    </div>
  );
};