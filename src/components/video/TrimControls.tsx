import React, { useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Scissors, RotateCcw, Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { WaveformView } from './WaveformView';

interface TrimControlsProps {
  duration: number;
  trimRange: number[];
  onTrimRangeChange: (newRange: number[]) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export const TrimControls = ({ duration, trimRange, onTrimRangeChange, videoRef }: TrimControlsProps) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);

  // Update video time when trim range changes
  useEffect(() => {
    if (videoRef.current) {
      const startTime = (trimRange[0] / 100) * duration;
      videoRef.current.currentTime = startTime;
      setCurrentTime(startTime);
    }
  }, [trimRange, duration]);

  // Handle video time updates
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      // Stop playback if we reach the end of trim range
      const endTime = (trimRange[1] / 100) * duration;
      if (video.currentTime >= endTime) {
        video.pause();
        setIsPlaying(false);
        video.currentTime = (trimRange[0] / 100) * duration;
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [trimRange, duration]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    onTrimRangeChange([0, 100]);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        const startTime = (trimRange[0] / 100) * duration;
        videoRef.current.currentTime = startTime;
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      const startTime = (trimRange[0] / 100) * duration;
      const newTime = Math.max(startTime, currentTime - 5);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      const endTime = (trimRange[1] / 100) * duration;
      const newTime = Math.min(endTime, currentTime + 5);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleTimeUpdate = (time: number) => {
    if (time >= 0 && time <= duration) {
      setCurrentTime(time);
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Trim Video</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <WaveformView videoRef={videoRef} onTimeUpdate={handleTimeUpdate} />

      <div className="relative">
        <Slider
          value={trimRange}
          onValueChange={(newRange) => {
            onTrimRangeChange(newRange);
            const newTime = (newRange[0] / 100) * duration;
            if (videoRef.current) {
              videoRef.current.currentTime = newTime;
              setCurrentTime(newTime);
            }
          }}
          max={100}
          step={1}
          className="w-full"
        />
      </div>

      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{formatTime((trimRange[0] / 100) * duration)}</span>
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime((trimRange[1] / 100) * duration)}</span>
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={skipBackward}
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={togglePlayPause}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={skipForward}
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Scissors className="h-4 w-4" />
        <span>Drag the handles to trim your video</span>
      </div>
    </div>
  );
};