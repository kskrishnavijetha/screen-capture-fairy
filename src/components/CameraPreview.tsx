import React, { useEffect, useRef, useState } from 'react';
import { useIsMobile } from "@/hooks/use-mobile";
import { ZoomController } from './zoom/ZoomController';
import { BackgroundRemoval } from './video/BackgroundRemoval';
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";

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
  const [backgroundRemoval, setBackgroundRemoval] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const showCameraPreview = async () => {
      if ((captureMode === 'camera' || captureMode === 'both') && videoRef.current) {
        try {
          if (!streamRef.current) {
            console.log('Requesting camera access...');
            const stream = await navigator.mediaDevices.getUserMedia({ 
              video: {
                width: { ideal: isMobile ? 640 : 1280 },
                height: { ideal: isMobile ? 480 : 720 },
                facingMode: isMobile ? "user" : undefined
              },
              audio: false
            });
            console.log('Camera access granted:', stream.getVideoTracks()[0].label);
            streamRef.current = stream;
            videoRef.current.srcObject = stream;
            
            // Ensure the video plays
            try {
              await videoRef.current.play();
              console.log('Video preview started playing');
            } catch (playError) {
              console.error('Error playing video:', playError);
              toast({
                variant: "destructive",
                title: "Preview Error",
                description: "Failed to start video preview. Please check camera permissions."
              });
            }
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          toast({
            variant: "destructive",
            title: "Camera Access Error",
            description: "Failed to access camera. Please check permissions."
          });
        }
      }
    };

    const cleanup = () => {
      if (streamRef.current) {
        console.log('Cleaning up camera stream');
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log('Stopped track:', track.label);
        });
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    if (isRecording) {
      showCameraPreview();
    } else {
      cleanup();
    }

    return cleanup;
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

  if (captureMode !== 'camera' && captureMode !== 'both') {
    return null;
  }

  return (
    <>
      <div
        ref={containerRef}
        className={`fixed cursor-move overflow-hidden transition-transform duration-200 ${
          isDragging ? 'opacity-75 scale-105' : ''
        }`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          width: isMobile ? '120px' : '180px',
          height: isMobile ? '120px' : '180px',
          zIndex: 1000,
          touchAction: 'none',
          borderRadius: '50%',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          background: '#1A1F2C'
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover rounded-full transform scale-[1.02]"
        />
        <BackgroundRemoval
          videoRef={videoRef}
          enabled={backgroundRemoval}
          onToggle={setBackgroundRemoval}
        />
        <div className="absolute inset-0 rounded-full ring-2 ring-primary/20 pointer-events-none" />
        
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-background/80 px-3 py-1.5 rounded-full shadow-lg">
          <span className="text-xs">Background</span>
          <Switch
            checked={backgroundRemoval}
            onCheckedChange={setBackgroundRemoval}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </div>
      <ZoomController videoRef={videoRef} isRecording={isRecording} />
    </>
  );
};