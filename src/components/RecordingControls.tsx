import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Pause, Play, Camera, StopCircle } from 'lucide-react';
import { Timer } from './Timer';
import { toast } from "@/components/ui/use-toast";
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

  return (
    <div className="fixed inset-x-0 bottom-0 p-4 space-y-4 bg-gradient-to-t from-black/80 to-transparent">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-20">
        <Timer 
          duration={elapsedTime} 
          onMaxDurationReached={onMaxDurationReached}
        />
      </div>
      
      <div className="max-w-xl mx-auto space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={isPaused ? onResume : onPause}
            variant="outline"
            className="w-full bg-black/50 border-white/10 hover:bg-black/70"
          >
            {isPaused ? (
              <>
                <Play className="mr-2 h-5 w-5" />
                Resume Recording
              </>
            ) : (
              <>
                <Pause className="mr-2 h-5 w-5" />
                Pause Recording
              </>
            )}
          </Button>
          
          <Button 
            onClick={takeScreenshot}
            variant="outline"
            className="w-full bg-black/50 border-white/10 hover:bg-black/70"
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

      <div className="fixed bottom-4 right-4">
        <VoiceCommandListener
          onPause={onPause}
          onResume={onResume}
          onStop={onStop}
          isRecording={true}
          isPaused={isPaused}
        />
      </div>
    </div>
  );
};