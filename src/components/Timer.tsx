import React, { useEffect, useState } from 'react';
import { toast } from "@/hooks/use-toast";

interface TimerProps {
  duration: number;
  maxDuration?: number;
  onMaxDurationReached?: () => void;
}

export const Timer = ({ 
  duration, 
  maxDuration = 180 * 60, // 180 minutes in seconds
  onMaxDurationReached 
}: TimerProps) => {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (duration >= maxDuration && !showWarning) {
      setShowWarning(true);
      toast({
        title: "Maximum recording time reached",
        description: "Recording will stop at 180 minutes",
        variant: "destructive"
      });
      onMaxDurationReached?.();
    }
  }, [duration, maxDuration, onMaxDurationReached, showWarning]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`text-xl font-mono ${duration >= maxDuration ? 'text-red-500' : 'text-primary'}`}>
      {formatTime(Math.min(duration, maxDuration))}
    </div>
  );
};