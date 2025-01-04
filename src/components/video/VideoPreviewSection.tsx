import React from 'react';
import { BlurControls } from './BlurControls';

interface VideoPreviewSectionProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  processedVideoUrl: string | null;
  blurRegions: Array<{ x: number, y: number, width: number, height: number }>;
  setBlurRegions: (regions: Array<{ x: number, y: number, width: number, height: number }>) => void;
}

export const VideoPreviewSection: React.FC<VideoPreviewSectionProps> = ({
  videoRef,
  processedVideoUrl,
  blurRegions,
  setBlurRegions
}) => {
  return (
    <>
      <div className="relative rounded-lg overflow-hidden bg-black">
        <video
          ref={videoRef}
          className="w-full"
          controls
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
            <video
              src={processedVideoUrl}
              className="w-full"
              controls
              autoPlay
            />
          </div>
        </div>
      )}
    </>
  );
};