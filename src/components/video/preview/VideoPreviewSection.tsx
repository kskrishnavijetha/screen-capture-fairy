import React from 'react';

interface VideoPreviewSectionProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  previewRef: React.RefObject<HTMLVideoElement>;
  videoUrl: string | null;
  processedVideoUrl: string | null;
  onMetadataLoaded?: (duration: number) => void;
  onTimeUpdate?: (time: number) => void;
}

export const VideoPreviewSection: React.FC<VideoPreviewSectionProps> = ({
  videoRef,
  previewRef,
  videoUrl,
  processedVideoUrl,
  onMetadataLoaded,
  onTimeUpdate,
}) => {
  const handleMetadataLoaded = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (onMetadataLoaded) {
      onMetadataLoaded(e.currentTarget.duration);
    }
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (onTimeUpdate) {
      onTimeUpdate(e.currentTarget.currentTime);
    }
  };

  if (!videoUrl) return null;

  return (
    <div className="space-y-6">
      <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          controls
          onLoadedMetadata={handleMetadataLoaded}
          onTimeUpdate={handleTimeUpdate}
        />
      </div>

      {processedVideoUrl && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Processed Video Preview</h3>
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
            <video
              ref={previewRef}
              src={processedVideoUrl}
              className="w-full h-full object-contain"
              controls
            />
          </div>
        </div>
      )}
    </div>
  );
};