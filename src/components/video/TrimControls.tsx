import React, { useState, useEffect } from 'react';
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isWaveformReady, setIsWaveformReady] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      
      videoRef.current.addEventListener('play', handlePlay);
      videoRef.current.addEventListener('pause', handlePause);
      
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('play', handlePlay);
          videoRef.current.removeEventListener('pause', handlePause);
        }
      };
    }
  }, [videoRef]);

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    onTrimRangeChange([0, 100]);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        duration, 
        videoRef.current.currentTime + 5
      );
    }
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const startTime = (trimRange[0] / 100) * (duration || 0);
  const endTime = (trimRange[1] / 100) * (duration || 0);

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

      <WaveformView 
        videoRef={videoRef} 
        onTimeUpdate={handleTimeUpdate}
        isReady={setIsWaveformReady}
      />

      {isWaveformReady && (
        <>
          <div className="relative">
            <Slider
              value={trimRange}
              onValueChange={onTrimRangeChange}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatTime(startTime)}</span>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(endTime)}</span>
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
        </>
      )}
    </div>
  );
};