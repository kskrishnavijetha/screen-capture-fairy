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
    watermarkImg.crossOrigin = "anonymous";
    watermarkImg.src = watermark.image;

    let animationFrameId: number;
    let isPlaying = false;

    const updateCanvas = () => {
      if (!videoRef.current || !canvas || !isPlaying) return;

      canvas.width = videoRef.current.videoWidth || videoRef.current.clientWidth;
      canvas.height = videoRef.current.videoHeight || videoRef.current.clientHeight;

      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const maxWidth = canvas.width * (watermark.size / 100);
      const scale = maxWidth / watermarkImg.width;
      const watermarkWidth = watermarkImg.width * scale;
      const watermarkHeight = watermarkImg.height * scale;

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

      ctx.globalAlpha = watermark.opacity;
      ctx.drawImage(watermarkImg, x, y, watermarkWidth, watermarkHeight);
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(updateCanvas);
    };

    const handlePlay = () => {
      isPlaying = true;
      updateCanvas();
    };

    const handlePause = () => {
      isPlaying = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };

    const handleEnded = () => {
      isPlaying = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };

    videoRef.current.addEventListener('play', handlePlay);
    videoRef.current.addEventListener('pause', handlePause);
    videoRef.current.addEventListener('ended', handleEnded);

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('play', handlePlay);
        videoRef.current.removeEventListener('pause', handlePause);
        videoRef.current.removeEventListener('ended', handleEnded);
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [watermark]);

  if (!videoUrl) return null;

  return (
    <div className="space-y-6">
      <div className="relative rounded-lg overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full"
          controls
          onLoadedMetadata={(e) => onMetadataLoaded?.(e.currentTarget.duration)}
          onTimeUpdate={(e) => onTimeUpdate?.(e.currentTarget.currentTime)}
        />
        {watermark && (
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
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