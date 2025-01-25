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
  const handleTimeUpdate = () => {
    if (onTimeUpdate && videoRef.current) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (onMetadataLoaded && videoRef.current) {
      onMetadataLoaded(videoRef.current.duration);
    }
  };

  if (!videoUrl) return null;

  return (
    <div className="space-y-4">
      <div className="relative rounded-lg overflow-hidden bg-black max-w-sm mx-auto">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full"
          controls
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          autoPlay={false}
          muted={false}
        />
      </div>

      {processedVideoUrl && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Processed Video Preview</h3>
          <div className="relative rounded-lg overflow-hidden bg-black max-w-sm mx-auto">
            <video
              ref={previewRef}
              src={processedVideoUrl}
              className="w-full"
              controls
              playsInline
              autoPlay={false}
              muted={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};