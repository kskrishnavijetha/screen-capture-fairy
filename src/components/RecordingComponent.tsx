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
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [captureMode, setCaptureMode] = useState<CaptureMode>('screen');
  const [showCountdown, setShowCountdown] = useState(false);
  const [filename, setFilename] = useState('recording');
  const [userEmail, setUserEmail] = useState<string | null>(null);

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
      const stopButton = document.getElementById('stop-recording') as HTMLButtonElement;
      if (stopButton) stopButton.click();
    }
    setIsRecording(false);
    setIsPaused(false);
    setRecordedBlob(null);
    setDuration(0);
    setShowCountdown(false);
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
        <div className="flex-1" /> {/* Empty div for spacing */}
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

      <div className={`${isMobile ? 'mt-4' : ''}`}>
        <CaptureModeSelector mode={captureMode} onChange={setCaptureMode} />
      </div>

      <RecordingManager
        captureMode={captureMode}
        frameRate={30}
        resolution={{ width: 1920, height: 1080, label: "1080p" }}
        onRecordingStart={() => setDuration(0)}
        onRecordingStop={(blob) => {
          setRecordedBlob(blob);
          navigate('/playback', { state: { recordedBlob: blob } });
        }}
        isRecording={isRecording}
        setIsRecording={setIsRecording}
        setIsPaused={setIsPaused}
        isPaused={isPaused}
      />

      {showCountdown && (
        <CountdownTimer
          seconds={5}
          onComplete={() => {
            setShowCountdown(false);
            const startButton = document.getElementById('start-recording') as HTMLButtonElement;
            if (startButton) startButton.click();
          }}
          onCancel={() => setShowCountdown(false)}
        />
      )}

      {isRecording && (
        <RecordingControls
          isPaused={isPaused}
          onPause={() => {
            const pauseButton = document.getElementById('pause-recording') as HTMLButtonElement;
            if (pauseButton) pauseButton.click();
          }}
          onResume={() => {
            const pauseButton = document.getElementById('pause-recording') as HTMLButtonElement;
            if (pauseButton) pauseButton.click();
          }}
          onStop={() => {
            const stopButton = document.getElementById('stop-recording') as HTMLButtonElement;
            if (stopButton) stopButton.click();
          }}
          duration={duration}
          onMaxDurationReached={() => {
            const stopButton = document.getElementById('stop-recording') as HTMLButtonElement;
            if (stopButton) stopButton.click();
          }}
        />
      )}

      <CameraPreview isRecording={isRecording} captureMode={captureMode} />

      {!isRecording && !showCountdown && (
        <Button 
          onClick={() => setShowCountdown(true)}
          className={`w-full bg-primary hover:bg-primary/90 ${isMobile ? 'mt-4' : ''}`}
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