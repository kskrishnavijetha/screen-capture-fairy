import React, { useEffect, useRef } from 'react';

interface CameraPreviewProps {
  isRecording: boolean;
  captureMode: 'camera' | 'both' | 'screen';
}

export const CameraPreview = ({ isRecording, captureMode }: CameraPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const showCameraPreview = async () => {
      if ((captureMode === 'camera' || captureMode === 'both') && videoRef.current) {
        try {
          // Only request new stream if we don't have one
          if (!streamRef.current) {
            const stream = await navigator.mediaDevices.getUserMedia({ 
              video: true,
              audio: false // Don't request audio for preview
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

    // Cleanup on unmount or when recording state changes
    return cleanup;
  }, [isRecording, captureMode]);

  if (captureMode !== 'camera' && captureMode !== 'both') {
    return null;
  }

  return (
    <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 shadow-md">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full max-w-md mx-auto rounded-lg"
      />
    </div>
  );
};