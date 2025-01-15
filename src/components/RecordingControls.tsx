import React from 'react';
import { Button } from "@/components/ui/button";
import { StopCircle, Pause, Play, Camera } from 'lucide-react';
import { Timer } from './Timer';
import { useToast } from "@/components/ui/use-toast";

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

  const takeScreenshot = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { mediaSource: "screen" } 
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
      
      // Clean up
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
    <div className="space-y-4">
      <div className="flex justify-center mb-4">
        <Timer 
          duration={duration} 
          onMaxDurationReached={onMaxDurationReached}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {!isPaused ? (
          <Button 
            onClick={onPause}
            variant="outline"
            className="w-full"
          >
            <Pause className="mr-2 h-5 w-5" />
            Pause Recording
          </Button>
        ) : (
          <Button 
            onClick={onResume}
            variant="outline"
            className="w-full"
          >
            <Play className="mr-2 h-5 w-5" />
            Resume Recording
          </Button>
        )}
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