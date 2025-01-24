import React, { useEffect, useRef, useState } from 'react';
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Camera, Mic } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

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
  const [hasPermissions, setHasPermissions] = useState<{camera: boolean, audio: boolean}>({ camera: false, audio: false });
  const isMobile = useIsMobile();

  const requestPermissions = async () => {
    try {
      // First check if we already have permissions
      const permissions = await navigator.mediaDevices.enumerateDevices();
      const hasVideoPermission = permissions.some(device => device.kind === 'videoinput' && device.label !== '');
      const hasAudioPermission = permissions.some(device => device.kind === 'audioinput' && device.label !== '');
      
      if (hasVideoPermission && hasAudioPermission) {
        setHasPermissions({ camera: true, audio: true });
        return true;
      }

      // Request permissions if we don't have them
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: isMobile ? 640 : 1280 },
          height: { ideal: isMobile ? 480 : 720 },
          facingMode: isMobile ? "user" : undefined
        },
        audio: true
      });

      // Stop the test stream immediately
      stream.getTracks().forEach(track => track.stop());
      
      setHasPermissions({ camera: true, audio: true });
      toast({
        title: "Permissions granted",
        description: "Camera and microphone access has been enabled"
      });
      return true;
    } catch (error: any) {
      console.error('Permission error:', error);
      let errorMessage = 'Please grant camera and microphone permissions to continue';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera and microphone access was denied. Please enable them in your device settings.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera or microphone found on your device';
      }
      
      toast({
        variant: "destructive",
        title: "Permission required",
        description: errorMessage
      });
      return false;
    }
  };

  useEffect(() => {
    const showCameraPreview = async () => {
      if ((captureMode === 'camera' || captureMode === 'both') && videoRef.current) {
        try {
          if (!streamRef.current) {
            const hasPermission = await requestPermissions();
            if (!hasPermission) return;

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

  if (!hasPermissions.camera || !hasPermissions.audio) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-background border rounded-lg p-4 shadow-lg">
        <h3 className="text-lg font-medium mb-2">Camera & Microphone Access Required</h3>
        <p className="text-sm text-muted-foreground mb-4">
          To record video and audio, we need permission to access your camera and microphone.
        </p>
        <Button 
          onClick={requestPermissions}
          className="w-full flex items-center justify-center gap-2"
        >
          <Camera className="h-4 w-4" />
          <Mic className="h-4 w-4" />
          <span>Grant Permissions</span>
        </Button>
      </div>
    );
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