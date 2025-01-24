import React, { useEffect, useRef, useState } from 'react';
import { useIsMobile } from "@/hooks/use-mobile";

interface CameraPreviewProps {
  isRecording: boolean;
  captureMode: 'camera' | 'both' | 'screen';
}

export const CameraPreview = ({ isRecording, captureMode }: CameraPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const isMobile = useIsMobile();

  useEffect(() => {
    const showCameraPreview = async () => {
      if ((captureMode === 'camera' || captureMode === 'both') && videoRef.current) {
        try {
          if (!streamRef.current) {
            const stream = await navigator.mediaDevices.getUserMedia({ 
              video: {
                width: { ideal: isMobile ? 640 : 1280 },
                height: { ideal: isMobile ? 480 : 720 },
                facingMode: isMobile ? "user" : undefined
              },
              audio: false
            });
            streamRef.current = stream;
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
        }
      }
    };

    const cleanup = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
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
    <div
      ref={containerRef}
      className={`fixed cursor-move rounded-lg overflow-hidden border border-gray-200 shadow-md ${
        isDragging ? 'opacity-75' : ''
      }`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: isMobile ? '160px' : '240px',
        zIndex: 1000,
        touchAction: 'none'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full rounded-lg"
      />
    </div>
  );
};