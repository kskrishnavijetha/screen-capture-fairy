import React, { useEffect } from 'react';

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
  useEffect(() => {
    if (duration >= maxDuration && onMaxDurationReached) {
      onMaxDurationReached();
    }
  }, [duration, maxDuration, onMaxDurationReached]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    const pad = (num: number) => num.toString().padStart(2, '0');
    
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
    }
    return `${pad(minutes)}:${pad(remainingSeconds)}`;
  };

  return (
    <div className={`text-2xl font-mono font-bold ${duration >= maxDuration ? 'text-destructive' : 'text-primary'}`}>
      {formatTime(Math.min(duration, maxDuration))}
    </div>
  );
};