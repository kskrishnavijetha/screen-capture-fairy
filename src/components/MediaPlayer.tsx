import React, { useRef, useState, useEffect } from 'react';
import { CommentSection } from './video/CommentSection';
import { CollaborativeControls } from './video/CollaborativeControls';
import { AnnotationControls } from './video/AnnotationControls';

interface MediaPlayerProps {
  recordedBlob: Blob;
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({ recordedBlob }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const videoId = recordedBlob.size.toString();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, []);

  const handlePlaybackChange = (playing: boolean) => {
    const video = videoRef.current;
    if (!video) return;

    if (playing) {
      video.play();
    } else {
      video.pause();
    }
    setIsPlaying(playing);
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <video
          ref={videoRef}
          src={URL.createObjectURL(recordedBlob)}
          controls
          className="w-full rounded-lg bg-black"
          onEnded={() => {
            URL.revokeObjectURL(URL.createObjectURL(recordedBlob));
            setIsPlaying(false);
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        <div className="absolute bottom-4 right-4">
          <CollaborativeControls
            videoId={videoId}
            onPlaybackChange={handlePlaybackChange}
            onSeek={handleSeek}
            currentTime={currentTime}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CommentSection videoId={videoId} />
        <AnnotationControls
          duration={videoRef.current?.duration || 0}
          videoId={videoId}
        />
      </div>
    </div>
  );
};