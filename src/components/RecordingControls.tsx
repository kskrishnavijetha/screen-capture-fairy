import React from 'react';
import { Button } from "@/components/ui/button";
import { StopCircle, Pause, Play } from 'lucide-react';
import { Timer } from './Timer';

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
  return (
    <div className="space-y-4">
      <div className="flex justify-center mb-4">
        <Timer 
          duration={duration} 
          onMaxDurationReached={onMaxDurationReached}
        />
      </div>
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