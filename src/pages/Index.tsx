import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MonitorPlay } from 'lucide-react';
import { CaptureModeSelector, type CaptureMode } from '@/components/CaptureModeSelector';
import { RecordingControls } from '@/components/RecordingControls';
import { Timer } from '@/components/Timer';
import { DownloadRecording } from '@/components/DownloadRecording';
import { CameraPreview } from '@/components/CameraPreview';
import { MediaPlayer } from '@/components/MediaPlayer';
import { RecordingManager } from '@/components/RecordingManager';
import { AnnotationTools } from '@/components/AnnotationTools';
import { ThemeSelector } from '@/components/ThemeSelector';
import { RecordingSettings } from '@/components/recording/RecordingSettings';
import { Resolution } from '@/types/recording';

const RESOLUTIONS: Resolution[] = [
  { label: "720p", width: 1280, height: 720 },
  { label: "1080p", width: 1920, height: 1080 },
  { label: "2K", width: 2560, height: 1440 },
  { label: "4K", width: 3840, height: 2160 },
];

const getThemeClasses = (themeName: string) => {
  switch (themeName) {
    case 'Ocean':
      return 'bg-[#222222] accent-[#0EA5E9]';
    case 'Forest':
      return 'bg-[#221F26] accent-[#22C55E]';
    case 'Sunset':
      return 'bg-[#403E43] accent-[#F97316]';
    case 'Berry':
      return 'bg-[#1A1F2C] accent-[#D946EF]';
    default:
      return 'bg-[#1A1F2C] accent-[#9b87f5]';
  }
};

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [captureMode, setCaptureMode] = useState<CaptureMode>('screen');
  const [frameRate, setFrameRate] = useState<number>(30);
  const [selectedResolution, setSelectedResolution] = useState<Resolution>(RESOLUTIONS[0]);
  const [currentTheme, setCurrentTheme] = useState('Default Dark');
  const [filename, setFilename] = useState('recording');

  const handleRecordingStart = () => {
    setDuration(0);
    setRecordedBlob(null);
  };

  const handleRecordingStop = (blob: Blob) => {
    setRecordedBlob(blob);
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 transition-colors duration-200 ${getThemeClasses(currentTheme)}`}>
      <div className="text-center space-y-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Screen Recorder</h1>
          <ThemeSelector currentTheme={currentTheme} onThemeChange={setCurrentTheme} />
        </div>
        
        <CaptureModeSelector 
          mode={captureMode} 
          onChange={setCaptureMode}
        />

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

        {isRecording && <Timer duration={duration} />}

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

        <CameraPreview 
          isRecording={isRecording} 
          captureMode={captureMode} 
        />

        <div className="space-y-4">
          {!isRecording ? (
            <Button 
              onClick={() => {
                const recordingManagerElement = document.querySelector('[data-start-recording]');
                const startRecordingFn = recordingManagerElement?.getAttribute('data-start-recording');
                if (startRecordingFn) {
                  (window as any)[startRecordingFn]();
                }
              }}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <MonitorPlay className="mr-2 h-5 w-5" />
              Start Recording
            </Button>
          ) : (
            <RecordingControls
              isPaused={isPaused}
              onPause={() => {
                const recordingManagerElement = document.querySelector('[data-pause-recording]');
                const pauseRecordingFn = recordingManagerElement?.getAttribute('data-pause-recording');
                if (pauseRecordingFn) {
                  (window as any)[pauseRecordingFn]();
                }
              }}
              onResume={() => {
                const recordingManagerElement = document.querySelector('[data-resume-recording]');
                const resumeRecordingFn = recordingManagerElement?.getAttribute('data-resume-recording');
                if (resumeRecordingFn) {
                  (window as any)[resumeRecordingFn]();
                }
              }}
              onStop={() => {
                const recordingManagerElement = document.querySelector('[data-stop-recording]');
                const stopRecordingFn = recordingManagerElement?.getAttribute('data-stop-recording');
                if (stopRecordingFn) {
                  (window as any)[stopRecordingFn]();
                }
              }}
            />
          )}
        </div>

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
      
      <AnnotationTools isRecording={isRecording} />
    </div>
  );
};

export default Index;