import React, { useState } from 'react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface TimestampControlsProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onSeek: (time: number) => void;
}

interface Timestamp {
  time: number;
  label: string;
}

export const TimestampControls = ({ videoRef, onSeek }: TimestampControlsProps) => {
  const [timestamps, setTimestamps] = useState<Timestamp[]>([]);
  const { toast } = useToast();

  const addTimestamp = () => {
    if (!videoRef.current) return;
    
    const currentTime = videoRef.current.currentTime;
    const label = prompt('Enter a label for this timestamp:');
    
    if (label) {
      setTimestamps(prev => [...prev, { time: currentTime, label }].sort((a, b) => a.time - b.time));
      toast({
        title: "Timestamp Added",
        description: `Added timestamp "${label}" at ${formatTime(currentTime)}`,
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={addTimestamp}
        variant="secondary"
        className="w-full"
      >
        Add Timestamp
      </Button>

      {timestamps.length > 0 && (
        <ScrollArea className="h-32 rounded-md border p-4">
          <h4 className="font-medium mb-2">Timestamps</h4>
          <div className="space-y-2">
            {timestamps.map((timestamp, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-2 hover:bg-accent rounded-lg cursor-pointer"
                onClick={() => onSeek(timestamp.time)}
              >
                <span className="font-medium">{timestamp.label}</span>
                <span className="text-sm text-muted-foreground">
                  {formatTime(timestamp.time)}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};