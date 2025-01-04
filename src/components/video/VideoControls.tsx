import React from 'react';
import { BlurControls } from './BlurControls';
import { TransitionSelector } from './TransitionSelector';
import { TrimControls } from './TrimControls';
import { CaptionControls } from './CaptionControls';
import { AnnotationControls } from './AnnotationControls';
import { WatermarkControls } from './WatermarkControls';

interface VideoControlsProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  videoUrl: string | null;
  isMetadataLoaded: boolean;
}

export const VideoControls = ({
  videoRef,
  videoUrl,
  isMetadataLoaded
}: VideoControlsProps) => {
  if (!videoUrl || !isMetadataLoaded) return null;

  return (
    <div className="space-y-4">
      <div className="relative rounded-lg overflow-hidden bg-black">
        <video
          ref={videoRef}
          className="w-full"
          controls
        />
        <BlurControls
          videoRef={videoRef}
          blurRegions={[]}
          setBlurRegions={() => {}}
        />
      </div>
      <TransitionSelector
        value="none"
        onChange={() => {}}
      />
      <TrimControls
        duration={videoRef.current?.duration || 0}
        trimRange={[0, 100]}
        onTrimRangeChange={() => {}}
      />
      <CaptionControls
        duration={videoRef.current?.duration || 0}
        captions={[]}
        onCaptionsChange={() => {}}
      />
      <AnnotationControls
        duration={videoRef.current?.duration || 0}
        annotations={[]}
        onAnnotationsChange={() => {}}
      />
      <WatermarkControls
        watermark={null}
        onWatermarkChange={() => {}}
      />
    </div>
  );
};