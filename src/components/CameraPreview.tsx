
import React, { useEffect, useRef, useState } from 'react';
import { useIsMobile } from "@/hooks/use-mobile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Layout } from 'lucide-react';

interface CameraPreviewProps {
  isRecording: boolean;
  captureMode: 'camera' | 'both' | 'screen';
}

export const CameraPreview = ({ isRecording, captureMode }: CameraPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [layout, setLayout] = useState<'corner' | 'side' | 'full'>('corner');
  const isMobile = useIsMobile();

  const startStream = async () => {
    if (!videoRef.current) return;

    try {
      const constraints = {
        video: {
          width: { ideal: isMobile ? 640 : 1280 },
          height: { ideal: isMobile ? 480 : 720 },
          facingMode: isMobile ? "user" : undefined,
          frameRate: { ideal: 30 }
        },
        audio: false // We don't need audio for the preview
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      
      try {
        await videoRef.current.play();
      } catch (playError) {
        console.error('Error playing video:', playError);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Failed to access camera. Please check your permissions.",
        variant: "destructive"
      });
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (isRecording && (captureMode === 'camera' || captureMode === 'both')) {
      startStream();
    } else {
      stopStream();
    }

    return () => {
      stopStream();
    };
  }, [isRecording, captureMode, isMobile]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    const maxX = window.innerWidth - (containerRef.current.offsetWidth || 0);
    const maxY = window.innerHeight - (containerRef.current.offsetHeight || 0);

    const constrainedX = Math.max(0, Math.min(newX, maxX));
    const constrainedY = Math.max(0, Math.min(newY, maxY));

    setPosition({
      x: constrainedX,
      y: constrainedY
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;

    const newX = e.touches[0].clientX - dragStart.x;
    const newY = e.touches[0].clientY - dragStart.y;

    const maxX = window.innerWidth - (containerRef.current.offsetWidth || 0);
    const maxY = window.innerHeight - (containerRef.current.offsetHeight || 0);

    const constrainedX = Math.max(0, Math.min(newX, maxX));
    const constrainedY = Math.max(0, Math.min(newY, maxY));

    setPosition({
      x: constrainedX,
      y: constrainedY
    });
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove as any);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove as any);
      document.addEventListener('touchend', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove as any);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove as any);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const getLayoutStyles = () => {
    const baseStyles = {
      touchAction: 'none' as const,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
      border: '2px solid rgba(255, 255, 255, 0.1)',
      background: '#1A1F2C',
      display: isRecording && (captureMode === 'camera' || captureMode === 'both') ? 'block' : 'none'
    };

    switch (layout) {
      case 'corner':
        return {
          ...baseStyles,
          width: isMobile ? '120px' : '180px',
          height: isMobile ? '120px' : '180px',
          borderRadius: '50%',
          position: 'fixed' as const,
          zIndex: 50
        };
      case 'side':
        return {
          ...baseStyles,
          width: isMobile ? '160px' : '240px',
          height: isMobile ? '240px' : '360px',
          borderRadius: '12px',
          position: 'fixed' as const,
          zIndex: 50
        };
      case 'full':
        return {
          ...baseStyles,
          width: '100%',
          height: '100%',
          borderRadius: '0px',
          position: 'fixed' as const,
          top: 0,
          left: 0,
          zIndex: 40
        };
      default:
        return baseStyles;
    }
  };

  // Only show layout controls when preview is active
  if (!isRecording || !(captureMode === 'camera' || captureMode === 'both')) {
    return null;
  }

  return (
    <>
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] flex items-center gap-2 bg-black/50 p-2 rounded-lg">
        <Layout className="h-4 w-4 text-white" />
        <Select value={layout} onValueChange={(value: 'corner' | 'side' | 'full') => setLayout(value)}>
          <SelectTrigger className="w-[100px] bg-transparent text-white border-none">
            <SelectValue placeholder="Layout" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="corner">Corner</SelectItem>
            <SelectItem value="side">Side</SelectItem>
            <SelectItem value="full">Full</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div
        ref={containerRef}
        className={`fixed cursor-move overflow-hidden transition-transform duration-200 ${
          isDragging ? 'opacity-75 scale-105' : ''
        }`}
        style={{
          transform: layout !== 'full' ? `translate(${position.x}px, ${position.y}px)` : undefined,
          ...getLayoutStyles(),
        }}
        onMouseDown={layout !== 'full' ? handleMouseDown : undefined}
        onTouchStart={layout !== 'full' ? handleTouchStart : undefined}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${layout === 'corner' ? 'rounded-full' : ''} transform scale-[1.02]`}
        />
        {layout === 'corner' && (
          <div className="absolute inset-0 rounded-full ring-2 ring-primary/20 pointer-events-none" />
        )}
      </div>
    </>
  );
};
