import React, { useEffect, useRef, useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { SensitiveDataControls } from './SensitiveDataControls';
import { detectSensitiveData, blurSensitiveAreas, type SensitiveDataType } from '@/utils/sensitiveDataDetection';

interface RecordingManagerProps {
  captureMode: 'camera' | 'both' | 'screen';
  frameRate?: number;
  resolution?: {
    width: number;
    height: number;
    label: string;
  };
  onRecordingStart?: () => void;
  onRecordingStop?: (blob: Blob) => void;
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
  isPaused: boolean;
  setIsPaused: (isPaused: boolean) => void;
}

export const RecordingManager = ({
  captureMode,
  frameRate = 30,
  resolution = { width: 1920, height: 1080, label: "1080p" },
  onRecordingStart,
  onRecordingStop,
  isRecording,
  setIsRecording,
  isPaused,
  setIsPaused
}: RecordingManagerProps) => {
  const [sensitiveDataEnabled, setSensitiveDataEnabled] = useState(false);
  const [selectedDataTypes, setSelectedDataTypes] = useState<SensitiveDataType[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const processFrame = async (videoTrack: MediaStreamTrack) => {
    if (!canvasRef.current || !sensitiveDataEnabled) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create a video element to capture frames
    const video = document.createElement('video');
    video.srcObject = new MediaStream([videoTrack]);
    await video.play();

    // Set canvas dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current frame
    ctx.drawImage(video, 0, 0);

    // Get the image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Detect sensitive data
    const detectedItems = await detectSensitiveData(imageData, {
      enabled: sensitiveDataEnabled,
      types: selectedDataTypes
    });

    // Apply blur effect to sensitive areas
    if (detectedItems.length > 0) {
      blurSensitiveAreas(canvas, detectedItems);
    }

    // Return the processed frame
    return canvas.captureStream(frameRate).getVideoTracks()[0];
  };

  const startRecording = async () => {
    try {
      let stream: MediaStream;

      if (captureMode === 'screen' || captureMode === 'both') {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            frameRate,
            width: resolution.width,
            height: resolution.height,
          },
          audio: true,
        });

        if (sensitiveDataEnabled) {
          const processedVideoTrack = await processFrame(stream.getVideoTracks()[0]);
          if (processedVideoTrack) {
            stream.removeTrack(stream.getVideoTracks()[0]);
            stream.addTrack(processedVideoTrack);
          }
        }
      }

      if (captureMode === 'camera' || captureMode === 'both') {
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        stream = new MediaStream([...stream.getVideoTracks(), ...cameraStream.getAudioTracks()]);
      }

      // Start recording logic here...

      setIsRecording(true);
      onRecordingStart?.();
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Failed to start recording",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    // Stop recording logic here...
    setIsRecording(false);
    onRecordingStop?.(new Blob()); // Replace with actual recorded blob
  };

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  return (
    <div className="space-y-4">
      <SensitiveDataControls
        enabled={sensitiveDataEnabled}
        onToggle={setSensitiveDataEnabled}
        selectedTypes={selectedDataTypes}
        onTypesChange={setSelectedDataTypes}
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <button id="start-recording" onClick={startRecording} style={{ display: 'none' }} />
      <button id="stop-recording" onClick={stopRecording} style={{ display: 'none' }} />
      <button id="pause-recording" onClick={togglePause} style={{ display: 'none' }} />
    </div>
  );
};
