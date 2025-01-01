import React from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { formatTime } from '@/utils/timeUtils';

interface TimestampProps {
  timestamps: Array<{ time: number; label: string }>;
  onSeek: (time: number) => void;
}

export const TimestampSection = ({ timestamps, onSeek }: TimestampProps) => {
  if (timestamps.length === 0) return null;

  return (
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
  );
};