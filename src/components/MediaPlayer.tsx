import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CommentSection } from './video/CommentSection';
import { CollaborativeControls } from './video/CollaborativeControls';
import { AnnotationControls } from './video/AnnotationControls';
import { TimelineView } from './video/timeline/TimelineView';
import { EmojiReactions } from './video/EmojiReactions';
import { toast } from './ui/use-toast';

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
    // Ensure the blob has the correct type for video and audio
    const url = URL.createObjectURL(
      new Blob([recordedBlob], { 
        type: 'video/webm; codecs=vp8,opus' 
      })
    );
    setVideoUrl(url);

    // Test audio playback
    const video = videoRef.current;
    if (video) {
      video.onloadedmetadata = () => {
        // Check if video has audio tracks
        if (video.mozHasAudio || // Firefox
            Boolean(video.webkitAudioDecodedByteCount) || // Chrome
            Boolean(video.audioTracks?.length)) { // Standard
          console.log('Audio tracks detected');
        } else {
          toast({
            title: "Audio Issue",
            description: "No audio track detected in the recording.",
            variant: "destructive"
          });
        }
      };
    }

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
      // Ensure both video and audio are unmuted
      video.muted = false;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error playing video:', error);
          toast({
            title: "Playback Error",
            description: "There was an error playing the video. Please try again.",
            variant: "destructive"
          });
        });
      }
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
          muted={false}
        />
        <EmojiReactions
          videoId={videoId}
          currentTime={currentTime}
          duration={videoRef.current?.duration || 0}
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