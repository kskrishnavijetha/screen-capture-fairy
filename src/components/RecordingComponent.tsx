import React, { useState } from 'react';
import { CameraPreview } from './CameraPreview';
import { RecordingControls } from './RecordingControls';
import { RecordingManager } from './RecordingManager';
import { CaptureModeSelector, CaptureMode } from './CaptureModeSelector';
import { RecordingSettings } from './recording/RecordingSettings';
import { useRecordingState } from '@/hooks/useRecordingState';
import { Resolution } from '@/types/recording';

interface RecordingComponentProps {
  onRecordingComplete?: (blob: Blob) => void;
}

const DEFAULT_RESOLUTIONS: Resolution[] = [
  { label: "720p", width: 1280, height: 720 },
  { label: "1080p", width: 1920, height: 1080 },
  { label: "4K", width: 3840, height: 2160 }
];

export const RecordingComponent = ({ onRecordingComplete }: RecordingComponentProps) => {
  const [captureMode, setCaptureMode] = useState<CaptureMode>('camera');
  const [frameRate, setFrameRate] = useState(30);
  const [resolution, setResolution] = useState<Resolution>(DEFAULT_RESOLUTIONS[0]);
  const { isRecording, isPaused, startRecording, stopRecording, togglePause } = useRecordingState();
  const [countdownSeconds, setCountdownSeconds] = useState(3);

  const handleRecordingComplete = (blob: Blob) => {
    if (onRecordingComplete) {
      onRecordingComplete(blob);
    }
  };

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto">
      <CaptureModeSelector
        mode={captureMode}
        onChange={setCaptureMode}
      />
      
      <RecordingSettings
        countdownSeconds={countdownSeconds}
        setCountdownSeconds={setCountdownSeconds}
        frameRate={frameRate}
        setFrameRate={setFrameRate}
        selectedResolution={resolution}
        setSelectedResolution={setResolution}
        resolutions={DEFAULT_RESOLUTIONS}
        isRecording={isRecording}
      />

      <CameraPreview
        isRecording={isRecording}
        captureMode={captureMode}
      />

      <RecordingControls
        isPaused={isPaused}
        onPause={togglePause}
        onResume={togglePause}
        onStop={stopRecording}
        duration={0}
      />

      <RecordingManager
        captureMode={captureMode}
        frameRate={frameRate}
        resolution={resolution}
        onRecordingStart={() => {}}
        onRecordingStop={handleRecordingComplete}
        isRecording={isRecording}
        setIsRecording={() => {}}
        isPaused={isPaused}
        setIsPaused={() => {}}
      />
    </div>
  );
};