import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CommentSection } from './video/CommentSection';
import { CollaborativeControls } from './video/CollaborativeControls';
import { AnnotationControls } from './video/AnnotationControls';
import { TimelineView } from './video/timeline/TimelineView';

interface MediaPlayerProps {
  recordedBlob: Blob;
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({ recordedBlob }) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const videoId = recordedBlob.size.toString();
  const [videoUrl, setVideoUrl] = useState<string>('');

  useEffect(() => {
    // Create and set video URL when component mounts or blob changes
    const url = URL.createObjectURL(recordedBlob);
    setVideoUrl(url);

    // Cleanup URL when component unmounts
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [recordedBlob]);

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
      video.play().catch(error => {
        console.error('Error playing video:', error);
      });
    } else {
      video.pause();
    }
    setIsPlaying(playing);
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/recorder')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/playback', { state: { recordedBlob } })}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative">
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          playsInline
          className="w-full rounded-lg bg-black"
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
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
        <div className="space-y-4">
          <CommentSection videoId={videoId} />
          <AnnotationControls
            duration={videoRef.current?.duration || 0}
            videoId={videoId}
            currentTime={currentTime}
            onAnnotationClick={handleSeek}
          />
        </div>
        <TimelineView
          videoId={videoId}
          currentTime={currentTime}
          onSeek={handleSeek}
        />
      </div>
    </div>
  );
};