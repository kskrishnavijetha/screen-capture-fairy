import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { MonitorPlay } from 'lucide-react';
import { CaptureModeSelector, type CaptureMode } from '@/components/CaptureModeSelector';
import { RecordingControls } from '@/components/RecordingControls';
import { DownloadRecording } from '@/components/DownloadRecording';
import { CameraPreview } from '@/components/CameraPreview';
import { MediaPlayer } from '@/components/MediaPlayer';
import { RecordingManager } from '@/components/RecordingManager';
import { RecordingSettings } from '@/components/recording/RecordingSettings';
import { Resolution } from '@/types/recording';

const RESOLUTIONS: Resolution[] = [
  { label: "720p", width: 1280, height: 720 },
  { label: "1080p", width: 1920, height: 1080 },
  { label: "2K", width: 2560, height: 1440 },
  { label: "4K", width: 3840, height: 2160 },
];

export const RecordingComponent = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [captureMode, setCaptureMode] = useState<CaptureMode>('screen');
  const [frameRate, setFrameRate] = useState<number>(30);
  const [selectedResolution, setSelectedResolution] = useState<Resolution>(RESOLUTIONS[0]);
  const [filename, setFilename] = useState('recording');

  const handleRecordingStart = () => {
    setDuration(0);
    setRecordedBlob(null);
  };

  const handleRecordingStop = (blob: Blob) => {
    setRecordedBlob(blob);
  };

  const handleMaxDurationReached = () => {
    const stopButton = document.getElementById('stop-recording') as HTMLButtonElement;
    if (stopButton) stopButton.click();
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  return (
    <div className="text-center space-y-6 w-full max-w-md mx-auto">
      <CaptureModeSelector mode={captureMode} onChange={setCaptureMode} />

      <RecordingSettings
        countdownSeconds={3}
        setCountdownSeconds={() => {}}
        frameRate={frameRate}
        setFrameRate={setFrameRate}
        selectedResolution={selectedResolution}
        setSelectedResolution={setSelectedResolution}
        resolutions={RESOLUTIONS}
        isRecording={isRecording}
      />

      <RecordingManager
        captureMode={captureMode}
        frameRate={frameRate}
        resolution={selectedResolution}
        onRecordingStart={handleRecordingStart}
        onRecordingStop={handleRecordingStop}
        isRecording={isRecording}
        setIsRecording={setIsRecording}
        setIsPaused={setIsPaused}
        isPaused={isPaused}
      />

      {isRecording && (
        <RecordingControls
          isPaused={isPaused}
          onPause={() => {
            const pauseButton = document.getElementById('pause-recording') as HTMLButtonElement;
            if (pauseButton) pauseButton.click();
          }}
          onResume={() => {
            const resumeButton = document.getElementById('resume-recording') as HTMLButtonElement;
            if (resumeButton) resumeButton.click();
          }}
          onStop={() => {
            const stopButton = document.getElementById('stop-recording') as HTMLButtonElement;
            if (stopButton) stopButton.click();
          }}
          duration={duration}
          onMaxDurationReached={handleMaxDurationReached}
        />
      )}

      <CameraPreview isRecording={isRecording} captureMode={captureMode} />

      {!isRecording && (
        <Button 
          onClick={() => {
            const startButton = document.getElementById('start-recording') as HTMLButtonElement;
            if (startButton) startButton.click();
          }}
          className="w-full bg-primary hover:bg-primary/90"
        >
          <MonitorPlay className="mr-2 h-5 w-5" />
          Start Recording
        </Button>
      )}

      {recordedBlob && !isRecording && (
        <>
          <MediaPlayer recordedBlob={recordedBlob} />
          <DownloadRecording
            recordedBlob={recordedBlob}
            filename={filename}
            onFilenameChange={setFilename}
          />
        </>
      )}
    </div>
  );
};