import React, { useEffect } from 'react';
import { Resolution } from '@/types/recording';
import { CaptureMode } from '@/components/CaptureModeSelector';
import { useRecordingState } from '@/hooks/useRecordingState';

interface RecordingManagerProps {
  captureMode: CaptureMode;
  frameRate: number;
  resolution: Resolution;
  onRecordingStart: () => void;
  onRecordingStop: (blob: Blob) => void;
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
  isPaused: boolean;
  setIsPaused: (isPaused: boolean) => void;
}

export const RecordingManager: React.FC<RecordingManagerProps> = ({
  captureMode,
  frameRate,
  resolution,
  onRecordingStart,
  onRecordingStop,
  setIsRecording: setParentIsRecording,
  setIsPaused: setParentIsPaused,
}) => {
  const {
    isRecording,
    isPaused,
    startRecording,
    stopRecording,
    togglePause
  } = useRecordingState();

  useEffect(() => {
    setParentIsRecording(isRecording);
  }, [isRecording, setParentIsRecording]);

  useEffect(() => {
    setParentIsPaused(isPaused);
  }, [isPaused, setParentIsPaused]);

  return (
    <div className="hidden">
      <button 
        id="start-recording" 
        onClick={() => startRecording(captureMode, frameRate, resolution, onRecordingStart, onRecordingStop)}
      >
        Start
      </button>
      <button 
        id="stop-recording" 
        onClick={stopRecording}
      >
        Stop
      </button>
      <button 
        id="pause-recording" 
        onClick={togglePause}
      >
        {isPaused ? 'Resume' : 'Pause'}
      </button>
    </div>
  );
};