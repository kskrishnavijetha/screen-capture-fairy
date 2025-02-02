import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { MonitorPlay, LogOut, User, ArrowLeft, ArrowRight, Camera, Square } from 'lucide-react';
import { CaptureModeSelector, type CaptureMode } from '@/components/CaptureModeSelector';
import { RecordingControls } from '@/components/RecordingControls';
import { DownloadRecording } from '@/components/DownloadRecording';
import { CameraPreview } from '@/components/CameraPreview';
import { RecordingManager } from '@/components/RecordingManager';
import { CountdownTimer } from '@/components/CountdownTimer';
import { DrawingToolbar, type DrawingTool } from './drawing/DrawingToolbar';
import { DrawingCanvas } from './drawing/DrawingCanvas';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
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
    checkSession();
  }, []);

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
    try {
      await startRecording(
        captureMode,
        frameRate,
        resolution,
        () => {
          toast({
            title: "Recording started",
            description: "Your screen recording has begun"
          });
        },
        (blob: Blob) => setRecordedBlob(blob)
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Recording failed",
        description: "Failed to start recording. Please try again."
      });
    }
  };

  const handleStopRecording = () => {
    stopRecording();
    toast({
      title: "Recording stopped",
      description: "Your recording has been saved"
    });
  };

  const handleTakeScreenshot = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { displaySurface: 'monitor' } 
      });
      
      const track = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track);
      const bitmap = await imageCapture.grabFrame();
      
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext('2d');
      context?.drawImage(bitmap, 0, 0);
      
      const link = document.createElement('a');
      link.download = `screenshot-${new Date().toISOString()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      stream.getTracks().forEach(track => track.stop());
      
      toast({
        title: "Screenshot captured",
        description: "Your screenshot has been saved",
      });
    } catch (error) {
      console.error('Error taking screenshot:', error);
      toast({
        variant: "destructive",
        title: "Screenshot failed",
        description: "Failed to capture screenshot",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="fixed top-4 right-4 flex gap-2">
        {isRecording && (
          <div className="bg-background/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-border">
            <div className="text-4xl font-mono font-bold text-primary mb-4">
              {String(Math.floor(duration / 60)).padStart(2, '0')}:
              {String(duration % 60).padStart(2, '0')}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleTakeScreenshot}
              >
                <Camera className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                onClick={handleStopRecording}
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                Stop Recording
              </Button>
            </div>
          </div>
        )}
        {!isRecording && (
          <Button
            onClick={handleStartRecording}
            className="bg-primary hover:bg-primary/90"
          >
            Start Recording
          </Button>
        )}
      </div>

      {recordedBlob && (
        <DownloadRecording
          recordedBlob={recordedBlob}
          filename={filename}
          onClose={() => setRecordedBlob(null)}
        />
      )}
    </div>
  );
};