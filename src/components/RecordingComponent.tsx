import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { MonitorPlay, LogOut, User, ArrowLeft, ArrowRight } from 'lucide-react';
import { CaptureModeSelector, type CaptureMode } from '@/components/CaptureModeSelector';
import { RecordingControls } from '@/components/RecordingControls';
import { DownloadRecording } from '@/components/DownloadRecording';
import { CameraPreview } from '@/components/CameraPreview';
import { RecordingManager } from '@/components/RecordingManager';
import { CountdownTimer } from '@/components/CountdownTimer';
import { DrawingToolbar, type DrawingTool } from './drawing/DrawingToolbar';
import { DrawingCanvas } from './drawing/DrawingCanvas';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRecordingState } from '@/hooks/useRecordingState';
import { Resolution } from '@/types/recording';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const RecordingComponent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { 
    isRecording, 
    isPaused,
    startRecording,
    stopRecording,
    togglePause 
  } = useRecordingState();
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [captureMode, setCaptureMode] = useState<CaptureMode>('screen');
  const [showCountdown, setShowCountdown] = useState(false);
  const [filename, setFilename] = useState('recording');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [currentRecordingIndex, setCurrentRecordingIndex] = useState(0);
  const [recordings, setRecordings] = useState<{ blob: Blob; timestamp: Date }[]>([]);
  const [activeTool, setActiveTool] = useState<DrawingTool>('pen');
  const [activeColor, setActiveColor] = useState('#FF0000');
  const [isDrawingEnabled, setIsDrawingEnabled] = useState(false);
  const frameRate = 30;
  const resolution: Resolution = { width: 1920, height: 1080, label: 'Full HD' };

  useEffect(() => {
    const loadRecordings = () => {
      const existingRecordings = localStorage.getItem('recordings');
      if (existingRecordings) {
        try {
          const parsedRecordings = JSON.parse(existingRecordings);
          const processedRecordings = parsedRecordings.map((recording: any) => ({
            blob: new Blob([new Uint8Array(recording.blob)], { type: 'video/webm' }),
            timestamp: new Date(recording.timestamp)
          }));
          setRecordings(processedRecordings);
        } catch (error) {
          console.error('Error loading recordings:', error);
        }
      }
    };

    loadRecordings();
  }, []);

  const navigateRecordings = (direction: 'prev' | 'next') => {
    if (recordings.length === 0) return;

    let newIndex;
    if (direction === 'prev') {
      newIndex = currentRecordingIndex > 0 ? currentRecordingIndex - 1 : recordings.length - 1;
    } else {
      newIndex = currentRecordingIndex < recordings.length - 1 ? currentRecordingIndex + 1 : 0;
    }

    setCurrentRecordingIndex(newIndex);
    setRecordedBlob(recordings[newIndex].blob);
  };

  const checkSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      cleanupRecording();
      navigate('/signin');
      return;
    }
    
    setUserEmail(session.user.email);
  };

  const cleanupRecording = () => {
    if (isRecording) {
      stopRecording();
    }
    setRecordedBlob(null);
    setDuration(0);
    setShowCountdown(false);
  };

  const handleStartRecording = async () => {
    await startRecording(
      captureMode,
      frameRate,
      resolution,
      () => console.log('Recording started'),
      (blob: Blob) => setRecordedBlob(blob)
    );
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handleTogglePause = () => {
    togglePause();
  };

  const handleSignOut = async () => {
    try {
      cleanupRecording();
      await supabase.auth.signOut({ scope: 'local' });
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      });
      navigate('/signin');
    } catch (error) {
      console.error('Sign out error:', error);
      navigate('/signin');
    }
  };

  return (
    <div className={`text-center ${isMobile ? 'p-4' : 'space-y-6 w-full max-w-md mx-auto'}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size={isMobile ? "sm" : "icon"}
            onClick={() => navigateRecordings('prev')}
            disabled={recordings.length === 0}
          >
            <ArrowLeft className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
          </Button>
          <Button
            variant="outline"
            size={isMobile ? "sm" : "icon"}
            onClick={() => navigateRecordings('next')}
            disabled={recordings.length === 0}
          >
            <ArrowRight className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
          </Button>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size={isMobile ? "sm" : "icon"}>
              <User className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={isMobile ? "w-[200px]" : ""}>
            <DropdownMenuItem disabled className="text-sm">
              <User className="mr-2 h-4 w-4" />
              {userEmail}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut} className="text-sm">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {recordings.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Recording {currentRecordingIndex + 1} of {recordings.length}
        </div>
      )}

      {isDrawingEnabled && (
        <>
          <DrawingToolbar
            activeTool={activeTool}
            activeColor={activeColor}
            onToolChange={setActiveTool}
            onColorChange={setActiveColor}
          />
          <DrawingCanvas
            activeTool={activeTool}
            activeColor={activeColor}
            videoId={recordedBlob ? URL.createObjectURL(recordedBlob) : undefined}
          />
        </>
      )}

      <div className={`${isMobile ? 'mt-4' : ''}`}>
        <CaptureModeSelector mode={captureMode} onChange={setCaptureMode} />
      </div>

      <div className="flex gap-2 justify-center">
        <Button
          variant="outline"
          onClick={() => setIsDrawingEnabled(!isDrawingEnabled)}
          className="mb-4"
        >
          {isDrawingEnabled ? 'Disable Drawing' : 'Enable Drawing'}
        </Button>
      </div>

      <button onClick={handleStartRecording}>Start</button>
      <button onClick={handleStopRecording}>Stop</button>
      <button onClick={handleTogglePause}>
        {isPaused ? 'Resume' : 'Pause'}
      </button>
    </div>
  );
};
