import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { StopCircle, Pause, Play, Camera } from 'lucide-react';
import { Timer } from './Timer';
import { useToast } from "@/components/ui/use-toast";
import { VoiceCommandListener } from './VoiceCommandListener';

interface RecordingControlsProps {
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  duration: number;
  onMaxDurationReached?: () => void;
}

export const RecordingControls = ({
  isPaused,
  onPause,
  onResume,
  onStop,
  duration,
  onMaxDurationReached
}: RecordingControlsProps) => {
  const { toast } = useToast();
  const [elapsedTime, setElapsedTime] = useState(0);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (!isPaused) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPaused]);

  const takeScreenshot = async () => {
    try {
      const videoElement = document.querySelector('video');
      if (!videoElement) {
        throw new Error('No video element found');
      }

      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Could not get canvas context');
      }

      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      const link = document.createElement('a');
      link.download = `screenshot-${new Date().toISOString()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
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

  const handlePauseResume = () => {
    if (isPaused) {
      onResume();
      toast({
        title: "Recording resumed",
        description: "Your recording has resumed",
      });
    } else {
      onPause();
      toast({
        title: "Recording paused",
        description: "Your recording is paused",
      });
    }
  };

  const handleStop = () => {
    onStop();
    toast({
      title: "Recording stopped",
      description: "Your recording has been stopped",
    });
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 space-y-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-lg border shadow-lg">
      <div className="flex justify-center mb-4">
        <Timer 
          duration={elapsedTime} 
          onMaxDurationReached={onMaxDurationReached}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={handlePauseResume}
          variant="outline"
          className="flex-1"
        >
          {isPaused ? (
            <>
              <Play className="mr-2 h-5 w-5" />
              Resume
            </>
          ) : (
            <>
              <Pause className="mr-2 h-5 w-5" />
              Pause
            </>
          )}
        </Button>
        <Button 
          onClick={takeScreenshot}
          variant="outline"
          className="flex-1"
        >
          <Camera className="mr-2 h-5 w-5" />
          Screenshot
        </Button>
      </div>
      <Button 
        onClick={handleStop}
        variant="destructive"
        className="w-full"
      >
        <StopCircle className="mr-2 h-5 w-5" />
        Stop Recording
      </Button>
    </div>
  );
};