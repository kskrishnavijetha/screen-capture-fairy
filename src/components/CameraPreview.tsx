import React, { useEffect, useRef, useState } from 'react';
import { useIsMobile } from "@/hooks/use-mobile";
import { ZoomController } from './zoom/ZoomController';
import { BackgroundRemoval } from './video/BackgroundRemoval';
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { GestureControls, type GestureConfig } from './video/GestureControls';

interface CameraPreviewProps {
  isRecording: boolean;
  captureMode: 'camera' | 'both' | 'screen';
}

export const CameraPreview = ({ isRecording, captureMode }: CameraPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [backgroundRemoval, setBackgroundRemoval] = useState(false);
  const [gestureConfig, setGestureConfig] = useState<GestureConfig | null>(null);
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

  const handleGestureConfigChange = (config: GestureConfig) => {
    setGestureConfig(config);
    if (config.enabled) {
      toast({
        title: "Gesture Recognition Enabled",
        description: `Now detecting ${config.gesture} gestures`,
      });
    }
  };

  if (captureMode !== 'camera' && captureMode !== 'both') {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="relative w-full h-full max-w-screen-xl mx-auto">
        {/* Main camera preview */}
        <div 
          ref={containerRef}
          className="absolute left-1/2 -translate-x-1/2 bottom-48 flex flex-col items-center pointer-events-auto z-20"
        >
          <div className="relative w-40 h-40 rounded-full overflow-hidden mb-4 shadow-xl border-2 border-white/10 bg-black/90">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-[1.02]"
            />
            <BackgroundRemoval
              videoRef={videoRef}
              enabled={backgroundRemoval}
              onToggle={setBackgroundRemoval}
            />
            <div className="absolute inset-0 rounded-full ring-2 ring-white/10 pointer-events-none" />
            
            {gestureConfig?.enabled && (
              <div className="absolute text-4xl pointer-events-none animate-bounce top-2 right-2">
                {gestureConfig.emoji}
              </div>
            )}
          </div>

          {/* Controls below camera */}
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-full px-6 py-3 flex items-center gap-4 shadow-lg z-30">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/80">Background</span>
              <Switch
                checked={backgroundRemoval}
                onCheckedChange={setBackgroundRemoval}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>
        </div>

        {/* Gesture controls positioned on the right */}
        <div className="fixed top-32 right-4 w-64 pointer-events-auto z-40">
          <GestureControls onConfigChange={handleGestureConfigChange} />
        </div>
        
        {/* Zoom controller */}
        <div className="pointer-events-auto absolute bottom-24 left-4 z-30">
          <ZoomController videoRef={videoRef} isRecording={isRecording} />
        </div>
      </div>
    </div>
  );
};