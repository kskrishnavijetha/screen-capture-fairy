import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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

  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (canvas && video) {
        canvas.width = video.offsetWidth;
        canvas.height = video.offsetHeight;
        drawBlurRegions();
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [videoRef]);

  useEffect(() => {
    drawBlurRegions();
  }, [blurRegions, isBlurMode]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isBlurMode) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    setIsDrawing(true);
    setStartPos({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isBlurMode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBlurRegions();

    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isBlurMode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    const newRegion = {
      x: Math.min(startPos.x, x),
      y: Math.min(startPos.y, y),
      width: Math.abs(x - startPos.x),
      height: Math.abs(y - startPos.y)
    };

    if (newRegion.width > 5 && newRegion.height > 5) {
      setBlurRegions([...blurRegions, newRegion]);
      toast({
        title: "Blur Region Added",
        description: "A new blur region has been added to the video.",
      });
    }

    setIsDrawing(false);
  };

  const drawBlurRegions = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!isBlurMode) {
      canvas.style.cursor = 'default';
      return;
    }

    canvas.style.cursor = 'crosshair';
    blurRegions.forEach(region => {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
      ctx.fillRect(region.x, region.y, region.width, region.height);
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.strokeRect(region.x, region.y, region.width, region.height);
    });
  };

  const handleExitBlurMode = () => {
    setIsBlurMode(false);
    setIsDrawing(false);
    toast({
      title: "Blur Mode Disabled",
      description: "You have exited blur mode.",
    });
  };

  const handleClearBlurRegions = () => {
    setBlurRegions([]);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    toast({
      title: "Blur Regions Cleared",
      description: "All blur regions have been removed.",
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
      <div className="absolute bottom-4 left-4 right-4 flex gap-2">
        <Button
          variant={isBlurMode ? "default" : "secondary"}
          onClick={() => isBlurMode ? handleExitBlurMode() : setIsBlurMode(true)}
          className="flex items-center gap-2"
        >
          {isBlurMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {isBlurMode ? "Exit Blur Mode" : "Enter Blur Mode"}
        </Button>
        {blurRegions.length > 0 && (
          <Button
            variant="destructive"
            onClick={handleClearBlurRegions}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear Blur Regions
          </Button>
        )}
      </div>
    </>
  );
};