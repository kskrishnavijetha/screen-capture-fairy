import React, { useEffect, useState } from 'react';
import { toast } from "@/components/ui/use-toast";

interface TimerProps {
  duration: number;
  maxDuration?: number;
  onMaxDurationReached?: () => void;
}

export const Timer = ({ 
  duration, 
  maxDuration = 240 * 60, // 4 hours in seconds
  onMaxDurationReached 
}: TimerProps) => {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (duration >= maxDuration && !showWarning) {
      setShowWarning(true);
      toast({
        title: "Maximum recording time reached",
        description: "Recording will stop at 4 hours",
        variant: "destructive"
      });
      onMaxDurationReached?.();
    }
  }, [duration, maxDuration, onMaxDurationReached, showWarning]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`text-2xl font-mono font-bold ${duration >= maxDuration ? 'text-red-500' : 'text-white'}`}>
      {formatTime(Math.min(duration, maxDuration))}
    </div>
  );
};