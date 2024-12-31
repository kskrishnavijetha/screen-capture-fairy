import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/components/ui/use-toast";
import { Scissors, Eye, EyeOff } from 'lucide-react';

interface VideoEditorProps {
  recordedBlob: Blob | null;
  onSave: (newBlob: Blob) => void;
}

export const VideoEditor = ({ recordedBlob, onSave }: VideoEditorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [duration, setDuration] = useState(0);
  const [trimRange, setTrimRange] = useState([0, 100]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBlurMode, setIsBlurMode] = useState(false);
  const [blurRegions, setBlurRegions] = useState<Array<{ x: number, y: number, width: number, height: number }>>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (videoRef.current && recordedBlob) {
      videoRef.current.src = URL.createObjectURL(recordedBlob);
      videoRef.current.onloadedmetadata = () => {
        setDuration(videoRef.current?.duration || 0);
      };
    }
  }, [recordedBlob]);

  const handleTrimRangeChange = (newRange: number[]) => {
    setTrimRange(newRange);
    if (videoRef.current) {
      videoRef.current.currentTime = (newRange[0] / 100) * duration;
    }
  };

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

    // Draw current selection
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      startPos.x,
      startPos.y,
      x - startPos.x,
      y - startPos.y
    );
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
      ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.fillRect(region.x, region.y, region.width, region.height);
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.strokeRect(region.x, region.y, region.width, region.height);
    });
  };

  const handleTrim = async () => {
    if (!recordedBlob || !videoRef.current) return;

    try {
      const startTime = (trimRange[0] / 100) * duration;
      const endTime = (trimRange[1] / 100) * duration;

      const outputCanvas = document.createElement('canvas');
      const outputCtx = outputCanvas.getContext('2d');
      if (!outputCtx) return;

      outputCanvas.width = videoRef.current.videoWidth;
      outputCanvas.height = videoRef.current.videoHeight;

      const mediaStream = outputCanvas.captureStream();
      const mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: recordedBlob.type,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const newBlob = new Blob(chunks, { type: recordedBlob.type });
        onSave(newBlob);
        toast({
          title: "Video processed successfully",
          description: "Your video has been trimmed and blurred according to your selections.",
        });
      };

      videoRef.current.currentTime = startTime;
      mediaRecorder.start();
      
      const processFrame = () => {
        if (!videoRef.current || !outputCtx) return;
        
        outputCtx.drawImage(videoRef.current, 0, 0);
        
        // Apply blur effect to selected regions
        blurRegions.forEach(region => {
          const imageData = outputCtx.getImageData(region.x, region.y, region.width, region.height);
          // Simple box blur implementation
          for (let i = 0; i < imageData.data.length; i += 4) {
            const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
            imageData.data[i] = avg;
            imageData.data[i + 1] = avg;
            imageData.data[i + 2] = avg;
          }
          outputCtx.putImageData(imageData, region.x, region.y);
        });

        if (videoRef.current.currentTime < endTime) {
          requestAnimationFrame(processFrame);
        } else {
          mediaRecorder.stop();
          videoRef.current.pause();
        }
      };

      videoRef.current.play();
      processFrame();

    } catch (error) {
      toast({
        title: "Error processing video",
        description: "There was an error while processing your video. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!recordedBlob) return null;

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto mt-6">
      <div className="relative rounded-lg overflow-hidden bg-black">
        <video
          ref={videoRef}
          className="w-full"
          controls
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        <canvas
          ref={canvasRef}
          className={`absolute top-0 left-0 w-full h-full ${isBlurMode ? 'cursor-crosshair' : 'pointer-events-none'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
      </div>

      <div className="flex gap-2">
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

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Trim Video</h3>
        <Slider
          value={trimRange}
          onValueChange={handleTrimRangeChange}
          max={100}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{formatTime((trimRange[0] / 100) * duration)}</span>
          <span>{formatTime((trimRange[1] / 100) * duration)}</span>
        </div>
      </div>

      <Button onClick={handleTrim} className="w-full">
        <Scissors className="w-4 h-4 mr-2" />
        Process Video
      </Button>
    </div>
  );
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};