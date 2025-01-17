import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { MonitorPlay, LogOut, User } from 'lucide-react';
import { CaptureModeSelector, type CaptureMode } from '@/components/CaptureModeSelector';
import { RecordingControls } from '@/components/RecordingControls';
import { DownloadRecording } from '@/components/DownloadRecording';
import { CameraPreview } from '@/components/CameraPreview';
import { RecordingManager } from '@/components/RecordingManager';
import { CountdownTimer } from '@/components/CountdownTimer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const RecordingComponent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [captureMode, setCaptureMode] = useState<CaptureMode>('screen');
  const [showCountdown, setShowCountdown] = useState(false);
  const [filename, setFilename] = useState('recording');
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        await cleanupAndNavigateToSignIn();
        return;
      }
      setUserEmail(session.user.email);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        await cleanupAndNavigateToSignIn();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const cleanupAndNavigateToSignIn = async () => {
    // Stop any active recordings
    if (isRecording) {
      const stopButton = document.getElementById('stop-recording') as HTMLButtonElement;
      if (stopButton) stopButton.click();
    }

    // Stop any active media tracks
    try {
      const tracks = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      tracks.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Error stopping media tracks:', error);
    }

    // Clear all recording-related state
    setIsRecording(false);
    setIsPaused(false);
    setRecordedBlob(null);
    setDuration(0);
    setShowCountdown(false);
    setUserEmail(null);

    // Navigate to signin page
    navigate('/signin');
  };

  const handleSignOut = async () => {
    try {
      // First cleanup and navigate
      await cleanupAndNavigateToSignIn();
      
      // Then attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error during sign out:', error);
        // Even if sign out fails, we've already cleaned up and redirected
      }
    } catch (error) {
      console.error('Error during sign out:', error);
      // Even if there's an error, we've already cleaned up and redirected
    }
  };

  const handleRecordingStart = () => {
    setDuration(0);
    setRecordedBlob(null);
  };

  const handleRecordingStop = (blob: Blob) => {
    setRecordedBlob(blob);
    navigate('/playback', { state: { recordedBlob: blob } });
  };

  const handleMaxDurationReached = () => {
    const stopButton = document.getElementById('stop-recording') as HTMLButtonElement;
    if (stopButton) stopButton.click();
  };

  const startRecordingWithCountdown = () => {
    setShowCountdown(true);
  };

  const handleCountdownComplete = () => {
    setShowCountdown(false);
    const startButton = document.getElementById('start-recording') as HTMLButtonElement;
    if (startButton) startButton.click();
  };

  const handlePause = () => {
    const pauseButton = document.getElementById('pause-recording') as HTMLButtonElement;
    if (pauseButton) pauseButton.click();
  };

  const handleResume = () => {
    const pauseButton = document.getElementById('pause-recording') as HTMLButtonElement;
    if (pauseButton) pauseButton.click();
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
      <div className="flex justify-end mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled>
              <User className="mr-2 h-4 w-4" />
              {userEmail}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CaptureModeSelector mode={captureMode} onChange={setCaptureMode} />

      <RecordingManager
        captureMode={captureMode}
        frameRate={30}
        resolution={{ width: 1920, height: 1080, label: "1080p" }}
        onRecordingStart={handleRecordingStart}
        onRecordingStop={handleRecordingStop}
        isRecording={isRecording}
        setIsRecording={setIsRecording}
        setIsPaused={setIsPaused}
        isPaused={isPaused}
      />

      {showCountdown && (
        <CountdownTimer
          seconds={5}
          onComplete={handleCountdownComplete}
          onCancel={() => setShowCountdown(false)}
        />
      )}

      {isRecording && (
        <RecordingControls
          isPaused={isPaused}
          onPause={handlePause}
          onResume={handleResume}
          onStop={() => {
            const stopButton = document.getElementById('stop-recording') as HTMLButtonElement;
            if (stopButton) stopButton.click();
          }}
          duration={duration}
          onMaxDurationReached={handleMaxDurationReached}
        />
      )}

      <CameraPreview isRecording={isRecording} captureMode={captureMode} />

      {!isRecording && !showCountdown && (
        <Button 
          onClick={() => setShowCountdown(true)}
          className="w-full bg-primary hover:bg-primary/90"
        >
          <MonitorPlay className="mr-2 h-5 w-5" />
          Start Recording
        </Button>
      )}

      {recordedBlob && !isRecording && (
        <DownloadRecording
          recordedBlob={recordedBlob}
          filename={filename}
          onFilenameChange={setFilename}
        />
      )}
    </div>
  );
};