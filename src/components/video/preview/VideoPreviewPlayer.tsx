import React, { useEffect } from 'react';

interface VideoPreviewPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  src: string;
  onTimeUpdate?: (time: number) => void;
  onMetadataLoaded?: (duration: number) => void;
  className?: string;
}

export const VideoPreviewPlayer: React.FC<VideoPreviewPlayerProps> = ({
  videoRef,
  src,
  onTimeUpdate,
  onMetadataLoaded,
  className = "w-full rounded-lg bg-black"
}) => {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleMetadataLoaded = () => {
      const duration = video.duration;
      if (!isNaN(duration) && isFinite(duration) && onMetadataLoaded) {
        onMetadataLoaded(duration);
        console.log('Video metadata loaded, duration:', duration);
      }
    };

    const handleTimeUpdate = () => {
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
  }, [videoRef, onMetadataLoaded, onTimeUpdate]);

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      controls
    />
  );
};