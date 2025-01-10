import React from 'react';
import { BlurControls } from './BlurControls';

interface BlurSectionProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  blurRegions: Array<{ x: number; y: number; width: number; height: number }>;
  setBlurRegions: (regions: Array<{ x: number; y: number; width: number; height: number }>) => void;
}

export const BlurSection = ({
  videoRef,
  blurRegions,
  setBlurRegions
}: BlurSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Blur Regions</h3>
      <BlurControls
        videoRef={videoRef}
        blurRegions={blurRegions}
        setBlurRegions={setBlurRegions}
      />
    </div>
  );
};