import React, { useState } from 'react';
import { CameraPreview } from './CameraPreview';
import { RecordingControls } from './RecordingControls';
import { RecordingManager } from './RecordingManager';
import { CaptureModeSelector } from './CaptureModeSelector';
import { RecordingSettings } from './recording/RecordingSettings';
import { useRecordingState } from '@/hooks/useRecordingState';
import { Resolution } from '@/types/recording';
import { CaptureMode } from './CaptureModeSelector';

interface RecordingComponentProps {
  onRecordingComplete?: (blob: Blob) => void;
}

export const RecordingComponent = ({ onRecordingComplete }: RecordingComponentProps) => {
  const [captureMode, setCaptureMode] = useState<CaptureMode>('camera');
  const [frameRate, setFrameRate] = useState(30);
  const [resolution, setResolution] = useState<Resolution>({ width: 1280, height: 720 });
  const { isRecording, isPaused, startRecording, stopRecording, togglePause } = useRecordingState();

  const handleRecordingComplete = (blob: Blob) => {
    if (onRecordingComplete) {
      onRecordingComplete(blob);
    }
  };

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto">
      <CaptureModeSelector
        selectedMode={captureMode}
        onModeSelect={setCaptureMode}
      />
      
      <RecordingSettings
        frameRate={frameRate}
        setFrameRate={setFrameRate}
        resolution={resolution}
        setResolution={setResolution}
      />

      <CameraPreview
        captureMode={captureMode}
        frameRate={frameRate}
        resolution={resolution}
      />

      <RecordingControls
        isRecording={isRecording}
        isPaused={isPaused}
        onStartRecording={() => {
          startRecording(
            captureMode,
            frameRate,
            resolution,
            () => {},
            handleRecordingComplete
          );
        }}
        onStopRecording={stopRecording}
        onTogglePause={togglePause}
      />

      <RecordingManager
        isRecording={isRecording}
        isPaused={isPaused}
      />
    </div>
  );
};