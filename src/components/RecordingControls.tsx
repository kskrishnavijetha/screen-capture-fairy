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

  const handleHighlight = () => {
    // This is a placeholder for the highlight functionality
    // You can implement the actual highlight logic here
    toast({
      title: "Moment Highlighted",
      description: "This moment has been marked as important",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center mb-4">
        <Timer 
          duration={elapsedTime} 
          onMaxDurationReached={onMaxDurationReached}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          {!isPaused ? (
            <Button 
              onClick={onPause}
              variant="outline"
              className="flex-1"
            >
              <Pause className="mr-2 h-5 w-5" />
              Pause Recording
            </Button>
          ) : (
            <Button 
              onClick={onResume}
              variant="outline"
              className="flex-1"
            >
              <Play className="mr-2 h-5 w-5" />
              Resume Recording
            </Button>
          )}
          <VoiceCommandListener
            onPause={onPause}
            onResume={onResume}
            onStop={onStop}
            onHighlight={handleHighlight}
            isRecording={true}
            isPaused={isPaused}
          />
        </div>
        <Button 
          onClick={takeScreenshot}
          variant="outline"
          className="w-full"
        >
          <Camera className="mr-2 h-5 w-5" />
          Take Screenshot
        </Button>
      </div>
      <Button 
        onClick={onStop}
        variant="destructive"
        className="w-full"
      >
        <StopCircle className="mr-2 h-5 w-5" />
        Stop Recording
      </Button>
    </div>
  );
};