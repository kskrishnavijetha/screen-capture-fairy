import React, { useEffect, useRef, useState } from 'react';
import { pipeline } from '@huggingface/transformers';
import { processVideoFrame } from '@/utils/backgroundRemoval';
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

interface BackgroundRemovalProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const BackgroundRemoval: React.FC<BackgroundRemovalProps> = ({
  videoRef,
  enabled,
  onToggle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const processingCanvasRef = useRef<HTMLCanvasElement>(null);
  const [segmenter, setSegmenter] = useState<any>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const initializeAI = async () => {
      try {
        const segmenterInstance = await pipeline(
          'image-segmentation',
          'Xenova/segformer-b0-finetuned-ade-512-512',
          { device: 'webgpu' }
        );
        setSegmenter(segmenterInstance);
        toast({
          title: "Background removal ready",
          description: "AI model loaded successfully"
        });
      } catch (error) {
        console.error('Failed to initialize AI:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to initialize background removal"
        });
        onToggle(false);
      }
    };

    if (enabled && !segmenter) {
      initializeAI();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, segmenter, onToggle]);

  useEffect(() => {
    if (!enabled || !videoRef.current || !canvasRef.current || !processingCanvasRef.current || !segmenter) {
      return;
    }

    const processFrame = async () => {
      if (!videoRef.current || !canvasRef.current || !processingCanvasRef.current) return;

      const processingCtx = processingCanvasRef.current.getContext('2d');
      if (!processingCtx) return;

      // Draw current video frame to processing canvas
      processingCtx.drawImage(
        videoRef.current,
        0,
        0,
        processingCanvasRef.current.width,
        processingCanvasRef.current.height
      );

      // Process the frame
      await processVideoFrame(processingCanvasRef.current, canvasRef.current, segmenter);

      // Schedule next frame
      animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    // Start processing frames
    processFrame();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, videoRef, segmenter]);

  if (!enabled) return null;

  return (
    <div className="absolute inset-0">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        width={640}
        height={480}
      />
      <canvas
        ref={processingCanvasRef}
        className="hidden"
        width={640}
        height={480}
      />
    </div>
  );
};