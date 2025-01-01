import React from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { formatTime } from '@/utils/timeUtils';

interface TranscriptionProps {
  transcriptions: Array<{ text: string; timestamp: number }>;
  onSeek: (time: number) => void;
}

export const TranscriptionSection = ({ transcriptions, onSeek }: TranscriptionProps) => {
  if (transcriptions.length === 0) return null;

  return (
    <ScrollArea className="h-32 rounded-md border p-4">
      <h4 className="font-medium mb-2">Transcriptions</h4>
      <div className="space-y-2">
        {transcriptions.map((transcription, index) => (
          <div 
            key={index}
            className="flex flex-col p-2 hover:bg-accent rounded-lg cursor-pointer"
            onClick={() => onSeek(transcription.timestamp)}
          >
            <span className="text-sm">{transcription.text}</span>
            <span className="text-xs text-muted-foreground">
              {formatTime(transcription.timestamp)}
            </span>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};