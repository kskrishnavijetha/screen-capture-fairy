import React, { useEffect } from 'react';
import { VideoPreviewPlayer } from './VideoPreviewPlayer';
import { BlurControls } from '../BlurControls';

interface VideoPreviewSectionProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  previewRef: React.RefObject<HTMLVideoElement>;
  recordedBlob: Blob | null;
  processedVideoUrl: string | null;
  blurRegions: Array<{ x: number; y: number; width: number; height: number }>;
  setBlurRegions: React.Dispatch<React.SetStateAction<Array<{ x: number; y: number; width: number; height: number }>>>;
  onMetadataLoaded?: (duration: number) => void;
  onTimeUpdate?: (time: number) => void;
}

export const VideoPreviewSection: React.FC<VideoPreviewSectionProps> = ({
  videoRef,
  previewRef,
  recordedBlob,
  processedVideoUrl,
  blurRegions,
  setBlurRegions,
  onMetadataLoaded,
  onTimeUpdate,
}) => {
  const videoUrl = recordedBlob ? URL.createObjectURL(recordedBlob) : null;

  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  return (
    <div className="space-y-6">
      <div className="relative rounded-lg overflow-hidden bg-black">
        <VideoPreviewPlayer
          videoRef={videoRef}
          src={videoUrl}
          onMetadataLoaded={onMetadataLoaded}
          onTimeUpdate={onTimeUpdate}
        />
        <BlurControls
          videoRef={videoRef}
          blurRegions={blurRegions}
          setBlurRegions={setBlurRegions}
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