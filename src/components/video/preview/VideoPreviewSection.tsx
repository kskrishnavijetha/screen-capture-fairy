import React from 'react';
import { VideoPreviewPlayer } from './VideoPreviewPlayer';

interface VideoPreviewSectionProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  previewRef: React.RefObject<HTMLVideoElement>;
  recordedBlob: Blob | null;
  processedVideoUrl: string | null;
  onMetadataLoaded?: (duration: number) => void;
  onTimeUpdate?: (time: number) => void;
}

export const VideoPreviewSection: React.FC<VideoPreviewSectionProps> = ({
  videoRef,
  previewRef,
  recordedBlob,
  processedVideoUrl,
  onMetadataLoaded,
  onTimeUpdate,
}) => {
  const videoUrl = recordedBlob ? URL.createObjectURL(recordedBlob) : null;

  React.useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  if (!videoUrl) return null;

  return (
    <div className="space-y-6">
      <div className="relative rounded-lg overflow-hidden bg-black">
        <VideoPreviewPlayer
          videoRef={videoRef}
          src={videoUrl}
          onMetadataLoaded={onMetadataLoaded}
          onTimeUpdate={onTimeUpdate}
        />
      </div>

      {processedVideoUrl && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Processed Video Preview</h3>
          <div className="relative rounded-lg overflow-hidden bg-black">
            <VideoPreviewPlayer
              videoRef={previewRef}
              src={processedVideoUrl}
            />
          </div>
        </div>
      )}
    </div>
  );
};