import React, { useEffect } from 'react';

interface VideoPreviewPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  src: string | null;
  currentTime?: number;
  onTimeUpdate?: (time: number) => void;
  onMetadataLoaded?: (duration: number) => void;
}

export const VideoPreviewPlayer: React.FC<VideoPreviewPlayerProps> = ({
  videoRef,
  src,
  currentTime,
  onTimeUpdate,
  onMetadataLoaded,
}) => {
  useEffect(() => {
    if (!videoRef.current || !src) return;

    const video = videoRef.current;
    video.src = src;

    const handleMetadataLoaded = () => {
      if (!video) return;
      const duration = video.duration;
      if (isNaN(duration) || !isFinite(duration)) {
        console.error('Invalid video duration:', duration);
        return;
      }
      if (onMetadataLoaded) {
        onMetadataLoaded(duration);
      }
      console.log('Video metadata loaded:', { duration });
    };

    const handleTimeUpdate = () => {
      if (!video) return;
      if (onTimeUpdate) {
        onTimeUpdate(video.currentTime);
      }
    };

    video.addEventListener('loadedmetadata', handleMetadataLoaded);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('loadedmetadata', handleMetadataLoaded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [src, videoRef, onMetadataLoaded, onTimeUpdate]);

  return (
    <video
      ref={videoRef}
      className="w-full rounded-lg bg-black"
      controls
    />
  );
};