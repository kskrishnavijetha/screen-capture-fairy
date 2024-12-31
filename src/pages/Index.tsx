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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeSelector } from '@/components/ThemeSelector';

interface Resolution {
  label: string;
  width: number;
  height: number;
}

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
  const [filename, setFilename] = useState('screen-recording');
  const [duration, setDuration] = useState(0);
  const [captureMode, setCaptureMode] = useState<CaptureMode>('screen');
  const [frameRate, setFrameRate] = useState<number>(30);
  const [selectedResolution, setSelectedResolution] = useState<Resolution>(RESOLUTIONS[0]);
  const [currentTheme, setCurrentTheme] = useState('Default Dark');

  const handleRecordingStart = () => {
    setDuration(0);
    setRecordedBlob(null);
  };

  const handleRecordingStop = (blob: Blob) => {
    setRecordedBlob(blob);
  };

  const {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    showCountdown,
    countdownSeconds,
    setCountdownSeconds
  } = RecordingManager({
    captureMode,
    frameRate,
    resolution: selectedResolution,
    onRecordingStart: handleRecordingStart,
    onRecordingStop: handleRecordingStop,
    isRecording,
    setIsRecording,
    setIsPaused,
    isPaused
  });

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

        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="countdown" className="text-sm font-medium">
              Countdown Timer (seconds)
            </label>
            <Select
              value={countdownSeconds.toString()}
              onValueChange={(value) => setCountdownSeconds(Number(value))}
              disabled={isRecording}
            >
              <SelectTrigger id="countdown">
                <SelectValue placeholder="Select countdown duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 seconds</SelectItem>
                <SelectItem value="5">5 seconds</SelectItem>
                <SelectItem value="10">10 seconds</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="frameRate" className="text-sm font-medium">
              Frame Rate
            </label>
            <Select
              value={frameRate.toString()}
              onValueChange={(value) => setFrameRate(Number(value))}
              disabled={isRecording}
            >
              <SelectTrigger id="frameRate">
                <SelectValue placeholder="Select frame rate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 FPS</SelectItem>
                <SelectItem value="30">30 FPS</SelectItem>
                <SelectItem value="60">60 FPS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="resolution" className="text-sm font-medium">
              Resolution
            </label>
            <Select
              value={selectedResolution.label}
              onValueChange={(value) => {
                const resolution = RESOLUTIONS.find(r => r.label === value);
                if (resolution) setSelectedResolution(resolution);
              }}
              disabled={isRecording}
            >
              <SelectTrigger id="resolution">
                <SelectValue placeholder="Select resolution" />
              </SelectTrigger>
              <SelectContent>
                {RESOLUTIONS.map((resolution) => (
                  <SelectItem key={resolution.label} value={resolution.label}>
                    {resolution.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isRecording && <Timer duration={duration} />}

        {showCountdown}

        <CameraPreview 
          isRecording={isRecording} 
          captureMode={captureMode} 
        />

        <div className="space-y-4">
          {!isRecording ? (
            <Button 
              onClick={startRecording}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <MonitorPlay className="mr-2 h-5 w-5" />
              Start Recording
            </Button>
          ) : (
            <RecordingControls
              isPaused={isPaused}
              onPause={pauseRecording}
              onResume={resumeRecording}
              onStop={stopRecording}
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