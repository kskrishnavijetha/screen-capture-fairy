import React, { useEffect, useRef } from 'react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Scissors, RotateCcw } from 'lucide-react';

interface TrimControlsProps {
  duration: number;
  trimRange: number[];
  onTrimRangeChange: (newRange: number[]) => void;
}

export const TrimControls = ({ duration, trimRange, onTrimRangeChange }: TrimControlsProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    onTrimRangeChange([0, 100]);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw waveform background
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw selection area
    const startX = (trimRange[0] / 100) * canvas.width;
    const endX = (trimRange[1] / 100) * canvas.width;
    
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(startX, 0, endX - startX, canvas.height);

    // Draw waveform visualization
    ctx.strokeStyle = '#1e293b';
    ctx.beginPath();
    
    // Simulate waveform data
    for (let x = 0; x < canvas.width; x++) {
      const y = (Math.sin(x * 0.1) + 1) * canvas.height / 4 + canvas.height / 2;
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }, [trimRange]);

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

      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-24 rounded-md"
          width={800}
          height={100}
        />
        <div className="absolute bottom-0 left-0 right-0">
          <Slider
            value={trimRange}
            onValueChange={onTrimRangeChange}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{formatTime((trimRange[0] / 100) * duration)}</span>
        <span>{formatTime((trimRange[1] / 100) * duration)}</span>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Scissors className="h-4 w-4" />
        <span>Drag the handles to trim your video</span>
      </div>
    </div>
  );
};