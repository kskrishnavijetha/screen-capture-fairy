import React, { useEffect, useState } from 'react';
import { toast } from "@/hooks/use-toast";

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
      <div className="bg-background p-8 rounded-lg shadow-lg text-center">
        <div className="text-6xl font-bold mb-4 text-primary">
          {timeLeft}
        </div>
        <p className="text-lg mb-4">Recording will start in {timeLeft} seconds</p>
        <button
          onClick={onCancel}
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};