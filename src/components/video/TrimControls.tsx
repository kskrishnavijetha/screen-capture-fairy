import React from 'react';
import { Slider } from "@/components/ui/slider";

interface TrimControlsProps {
  duration: number;
  trimRange: number[];
  onTrimRangeChange: (newRange: number[]) => void;
}

export const TrimControls = ({ duration, trimRange, onTrimRangeChange }: TrimControlsProps) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Trim Video</h3>
      <Slider
        value={trimRange}
        onValueChange={onTrimRangeChange}
        max={100}
        step={1}
        className="w-full"
      />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{formatTime((trimRange[0] / 100) * duration)}</span>
        <span>{formatTime((trimRange[1] / 100) * duration)}</span>
      </div>
    </div>
  );
};