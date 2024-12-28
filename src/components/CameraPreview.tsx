import React, { useEffect, useRef } from 'react';

interface CameraPreviewProps {
  isRecording: boolean;
  captureMode: 'camera' | 'both' | 'screen';
}

export const CameraPreview = ({ isRecording, captureMode }: CameraPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const showCameraPreview = async () => {
      if ((captureMode === 'camera' || captureMode === 'both') && videoRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: true,
            audio: true 
          });
          videoRef.current.srcObject = stream;
        } catch (error) {
          console.error('Error accessing camera:', error);
        }
      }
    };

    if (isRecording) {
      showCameraPreview();
    } else if (videoRef.current?.srcObject) {
      // Stop all tracks when recording stops
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
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