import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from 'lucide-react';

interface BlurRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BlurControlsProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  blurRegions: BlurRegion[];
  setBlurRegions: (regions: BlurRegion[]) => void;
}

export const BlurControls = ({ videoRef, blurRegions, setBlurRegions }: BlurControlsProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isBlurMode, setIsBlurMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isBlurMode) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPos({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isBlurMode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBlurRegions(ctx);

    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isBlurMode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRegion = {
      x: Math.min(startPos.x, x),
      y: Math.min(startPos.y, y),
      width: Math.abs(x - startPos.x),
      height: Math.abs(y - startPos.y)
    };

    setBlurRegions([...blurRegions, newRegion]);
    setIsDrawing(false);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      drawBlurRegions(ctx);
    }
  };

  const drawBlurRegions = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    blurRegions.forEach(region => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(region.x, region.y, region.width, region.height);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(region.x, region.y, region.width, region.height);
    });
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        className={`absolute top-0 left-0 w-full h-full ${isBlurMode ? 'cursor-crosshair' : 'pointer-events-none'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div className="flex gap-2 mt-4">
        <Button
          variant={isBlurMode ? "default" : "secondary"}
          onClick={() => setIsBlurMode(!isBlurMode)}
          className="flex-1"
        >
          {isBlurMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
          {isBlurMode ? "Exit Blur Mode" : "Enter Blur Mode"}
        </Button>
        {blurRegions.length > 0 && (
          <Button
            variant="destructive"
            onClick={() => setBlurRegions([])}
            className="flex-1"
          >
            Clear Blur Regions
          </Button>
        )}
      </div>
    </>
  );
};