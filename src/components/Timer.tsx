import React from 'react';

interface TimerProps {
  duration: number;
}

export const Timer = ({ duration }: TimerProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-xl font-mono text-primary">
      {formatTime(duration)}
    </div>
  );
};