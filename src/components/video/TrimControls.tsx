import React, { useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { RotateCcw, Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface TrimControlsProps {
  duration: number;
  currentTime: number;
  trimRange: number[];
  onTrimRangeChange: (newRange: number[]) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export const TrimControls = ({
  duration,
  currentTime,
  trimRange,
  onTrimRangeChange,
  videoRef
}: TrimControlsProps) => {
  const [isPlaying, setIsPlaying] = React.useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const startTime = (trimRange[0] / 100) * duration;
      const endTime = (trimRange[1] / 100) * duration;
      
      if (video.currentTime >= endTime) {
        video.pause();
        setIsPlaying(false);
        video.currentTime = startTime;
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, [trimRange, duration, videoRef]);

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    onTrimRangeChange([0, 100]);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      const startTime = (trimRange[0] / 100) * duration;
      videoRef.current.currentTime = startTime;
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipBackward = () => {
    if (!videoRef.current) return;
    const startTime = (trimRange[0] / 100) * duration;
    const newTime = Math.max(startTime, currentTime - 5);
    videoRef.current.currentTime = newTime;
  };

  const skipForward = () => {
    if (!videoRef.current) return;
    const endTime = (trimRange[1] / 100) * duration;
    const newTime = Math.min(endTime, currentTime + 5);
    videoRef.current.currentTime = newTime;
  };

  const handleSliderChange = (newValue: number[]) => {
    onTrimRangeChange(newValue);
    if (videoRef.current) {
      const newTime = (newValue[0] / 100) * duration;
      videoRef.current.currentTime = newTime;
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

      <div className="space-y-2">
        <Slider
          value={trimRange}
          onValueChange={handleSliderChange}
          max={100}
          step={0.1}
          className="w-full"
        />

        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{formatTime((trimRange[0] / 100) * duration)}</span>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime((trimRange[1] / 100) * duration)}</span>
        </div>
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
    </div>
  );
};