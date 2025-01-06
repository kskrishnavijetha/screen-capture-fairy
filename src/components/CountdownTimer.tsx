import React, { useEffect, useState } from 'react';

interface CountdownTimerProps {
  seconds: number;
  onComplete: () => void;
  onCancel: () => void;
}

export const CountdownTimer = ({ seconds, onComplete, onCancel }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (timeLeft === 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-sidebar-primary/20 to-sidebar-primary/10 backdrop-blur-md p-8 rounded-lg shadow-lg text-center border-2 border-primary/20">
        <div className="text-8xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          {timeLeft}
        </div>
        <p className="text-xl mb-6 text-foreground/90">Recording will start in {timeLeft} seconds</p>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm bg-secondary/80 hover:bg-secondary rounded-md transition-colors text-foreground"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};