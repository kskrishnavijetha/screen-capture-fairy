import React from 'react';
import { formatTime } from '@/utils/timeUtils';

interface TimerProps {
  duration: number;
  onMaxDurationReached?: () => void;
  maxDuration?: number;
}

export const Timer = ({ 
  duration,
  maxDuration = 240 * 60, // 4 hours in seconds
  onMaxDurationReached 
}: TimerProps) => {
  React.useEffect(() => {
    if (duration >= maxDuration) {
      onMaxDurationReached?.();
    }
  }, [duration, maxDuration, onMaxDurationReached]);

  return (
    <div className="font-mono text-4xl font-bold text-white">
      {formatTime(Math.min(duration, maxDuration))}
    </div>
  );
};