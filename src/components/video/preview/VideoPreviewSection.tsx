import React, { useEffect, useRef } from 'react';

interface VideoPreviewSectionProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  previewRef: React.RefObject<HTMLVideoElement>;
  recordedBlob: Blob | null;
  processedVideoUrl: string | null;
  onMetadataLoaded?: (duration: number) => void;
  onTimeUpdate?: (time: number) => void;
  watermark?: {
    image: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    opacity: number;
    size: number;
  } | null;
}

export const VideoPreviewSection: React.FC<VideoPreviewSectionProps> = ({
  videoRef,
  previewRef,
  recordedBlob,
  processedVideoUrl,
  onMetadataLoaded,
  onTimeUpdate,
  watermark,
}) => {
  const videoUrl = recordedBlob ? URL.createObjectURL(recordedBlob) : null;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  useEffect(() => {
    if (!watermark || !videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const watermarkImg = new Image();
    watermarkImg.src = watermark.image;
    watermarkImg.onload = () => {
      const updateCanvas = () => {
        if (!videoRef.current || !canvas) return;
        
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        
        // Draw the video frame
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        // Calculate watermark dimensions
        const maxWidth = canvas.width * (watermark.size / 100);
        const scale = maxWidth / watermarkImg.width;
        const watermarkWidth = watermarkImg.width * scale;
        const watermarkHeight = watermarkImg.height * scale;
        
        // Calculate position
        const padding = Math.floor(canvas.width * 0.02);
        let x = padding;
        let y = padding;
        
        switch (watermark.position) {
          case 'top-right':
            x = canvas.width - watermarkWidth - padding;
            break;
          case 'bottom-left':
            y = canvas.height - watermarkHeight - padding;
            break;
          case 'bottom-right':
            x = canvas.width - watermarkWidth - padding;
            y = canvas.height - watermarkHeight - padding;
            break;
        }
        
        // Draw watermark
        ctx.globalAlpha = watermark.opacity;
        ctx.drawImage(watermarkImg, x, y, watermarkWidth, watermarkHeight);
        ctx.globalAlpha = 1.0;
        
        requestAnimationFrame(updateCanvas);
      };
      
      updateCanvas();
    };
  }, [watermark]);

  if (!videoUrl) return null;

  return (
    <div className="space-y-6">
      <div className="relative rounded-lg overflow-hidden bg-black">
        {watermark ? (
          <canvas
            ref={canvasRef}
            className="w-full"
          />
        ) : (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full"
            controls
            onLoadedMetadata={(e) => onMetadataLoaded?.(e.currentTarget.duration)}
            onTimeUpdate={(e) => onTimeUpdate?.(e.currentTarget.currentTime)}
          />
        )}
      </div>

      {processedVideoUrl && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Processed Video Preview</h3>
          <div className="relative rounded-lg overflow-hidden bg-black">
            <video
              ref={previewRef}
              src={processedVideoUrl}
              className="w-full"
              controls
            />
          </div>
        </div>
      )}
    </div>
  );
};