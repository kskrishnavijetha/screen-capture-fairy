import React, { useRef, useState } from 'react';
import { VideoEditor } from './VideoEditor';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface MediaPlayerProps {
  recordedBlob: Blob | null;
}

interface Timestamp {
  time: number;
  label: string;
}

export const MediaPlayer = ({ recordedBlob }: MediaPlayerProps) => {
  const [editedBlob, setEditedBlob] = React.useState<Blob | null>(null);
  const [timestamps, setTimestamps] = useState<Timestamp[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const currentBlob = editedBlob || recordedBlob;

  if (!currentBlob) return null;

  const videoUrl = URL.createObjectURL(currentBlob);

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

  const seekToTimestamp = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  return (
    <div className="mt-6 w-full">
      <h3 className="text-lg font-semibold mb-2 text-white">Recording Preview</h3>
      <div className="space-y-4">
        <video 
          ref={videoRef}
          src={videoUrl}
          controls
          className="w-full rounded-lg bg-black"
          onEnded={() => URL.revokeObjectURL(videoUrl)}
        />
        
        <div className="flex justify-between items-center">
          <Button 
            onClick={addTimestamp}
            variant="secondary"
            className="flex items-center gap-2"
          >
            Add Timestamp
          </Button>
        </div>

        {timestamps.length > 0 && (
          <ScrollArea className="h-32 rounded-md border p-4">
            <div className="space-y-2">
              {timestamps.map((timestamp, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 hover:bg-accent rounded-lg cursor-pointer"
                  onClick={() => seekToTimestamp(timestamp.time)}
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

      <VideoEditor 
        recordedBlob={currentBlob} 
        onSave={setEditedBlob}
      />
    </div>
  );
};