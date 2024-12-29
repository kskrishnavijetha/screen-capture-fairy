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

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [filename, setFilename] = useState('screen-recording');
  const [duration, setDuration] = useState(0);
  const [captureMode, setCaptureMode] = useState<CaptureMode>('screen');
  const [frameRate, setFrameRate] = useState<number>(30);

  const handleRecordingStart = () => {
    setDuration(0);
    setRecordedBlob(null);
  };

  const handleRecordingStop = (blob: Blob) => {
    setRecordedBlob(blob);
  };

  const recordingManager = RecordingManager({
    captureMode,
    frameRate,
    onRecordingStart: handleRecordingStart,
    onRecordingStop: handleRecordingStop,
    isRecording,
    setIsRecording,
    setIsPaused,
    isPaused
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center space-y-6 w-full max-w-md">
        <h1 className="text-4xl font-bold mb-8">Screen Recorder</h1>
        
        <CaptureModeSelector 
          mode={captureMode} 
          onChange={setCaptureMode}
        />

        <div className="space-y-4">
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
        </div>

        {isRecording && <Timer duration={duration} />}

        <CameraPreview 
          isRecording={isRecording} 
          captureMode={captureMode} 
        />

        <div className="space-y-4">
          {!isRecording ? (
            <Button 
              onClick={recordingManager.startRecording}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <MonitorPlay className="mr-2 h-5 w-5" />
              Start Recording
            </Button>
          ) : (
            <RecordingControls
              isPaused={isPaused}
              onPause={recordingManager.pauseRecording}
              onResume={recordingManager.resumeRecording}
              onStop={recordingManager.stopRecording}
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