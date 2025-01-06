import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { MonitorPlay, Sparkles, Menu } from 'lucide-react';
import { CaptureModeSelector, type CaptureMode } from '@/components/CaptureModeSelector';
import { RecordingControls } from '@/components/RecordingControls';
import { Timer } from '@/components/Timer';
import { DownloadRecording } from '@/components/DownloadRecording';
import { CameraPreview } from '@/components/CameraPreview';
import { MediaPlayer } from '@/components/MediaPlayer';
import { RecordingManager } from '@/components/RecordingManager';
import { ThemeSelector } from '@/components/ThemeSelector';
import { RecordingSettings } from '@/components/recording/RecordingSettings';
import { Resolution } from '@/types/recording';
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger } from "@/components/ui/sidebar";

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
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <div className="p-4 space-y-4">
              <h2 className="text-xl font-bold">Menu</h2>
              <nav className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <MonitorPlay className="mr-2 h-4 w-4" />
                  Recording
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Effects
                </Button>
              </nav>
            </div>
          </SidebarContent>
        </Sidebar>
        
        <div className={`flex-1 flex flex-col items-center justify-center min-h-screen p-4 transition-colors duration-200 ${getThemeClasses(currentTheme)}`}>
          <div className="absolute top-4 left-4 flex items-center gap-4">
            <SidebarTrigger />
            <img 
              src="/lovable-uploads/54cd55ec-2ab7-464a-a5c9-7388b5f53a05.png" 
              alt="ScreenCraft Logo" 
              className="w-12 h-12 object-contain"
            />
          </div>
          
          <div className="text-center space-y-6 w-full max-w-md">
            <div className="flex flex-col items-center mb-8 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                  ScreenCraft Fairy
                </h1>
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <p className="text-muted-foreground">Capture your screen with magic ✨</p>
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

            <CameraPreview 
              isRecording={isRecording} 
              captureMode={captureMode} 
            />

            <div className="space-y-4">
              {!isRecording ? (
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
              ) : (
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
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
