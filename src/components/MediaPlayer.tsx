import React, { useRef, useState } from 'react';
import { VideoEditor } from './VideoEditor';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface MediaPlayerProps {
  recordedBlob: Blob | null;
}

interface Timestamp {
  time: number;
  label: string;
}

interface Transcription {
  text: string;
  timestamp: number;
}

export const MediaPlayer = ({ recordedBlob }: MediaPlayerProps) => {
  const [editedBlob, setEditedBlob] = React.useState<Blob | null>(null);
  const [timestamps, setTimestamps] = useState<Timestamp[]>([]);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
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

  const startTranscription = async () => {
    if (!currentBlob) return;

    setIsTranscribing(true);
    try {
      // Create a new SpeechRecognition instance
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.continuous = true;
      recognition.interimResults = true;

      // Play the video while transcribing
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        await videoRef.current.play();
      }

      recognition.onresult = (event) => {
        const currentTime = videoRef.current?.currentTime || 0;
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ');

        setTranscriptions(prev => [...prev, {
          text: transcript,
          timestamp: currentTime
        }].sort((a, b) => a.timestamp - b.timestamp));
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast({
          variant: "destructive",
          title: "Transcription Error",
          description: "There was an error during transcription. Please try again.",
        });
      };

      recognition.onend = () => {
        setIsTranscribing(false);
        if (videoRef.current) {
          videoRef.current.pause();
        }
        toast({
          title: "Transcription Complete",
          description: "The video has been transcribed successfully.",
        });
      };

      recognition.start();
    } catch (error) {
      console.error('Transcription error:', error);
      setIsTranscribing(false);
      toast({
        variant: "destructive",
        title: "Transcription Error",
        description: "Failed to start transcription. Please ensure you have granted microphone permissions.",
      });
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
        
        <div className="flex justify-between items-center gap-2">
          <Button 
            onClick={addTimestamp}
            variant="secondary"
            className="flex items-center gap-2"
          >
            Add Timestamp
          </Button>
          <Button
            onClick={startTranscription}
            variant="secondary"
            disabled={isTranscribing}
            className="flex items-center gap-2"
          >
            {isTranscribing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Transcribing...
              </>
            ) : (
              'Start Transcription'
            )}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {timestamps.length > 0 && (
            <ScrollArea className="h-32 rounded-md border p-4">
              <h4 className="font-medium mb-2">Timestamps</h4>
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

          {transcriptions.length > 0 && (
            <ScrollArea className="h-32 rounded-md border p-4">
              <h4 className="font-medium mb-2">Transcriptions</h4>
              <div className="space-y-2">
                {transcriptions.map((transcription, index) => (
                  <div 
                    key={index}
                    className="flex flex-col p-2 hover:bg-accent rounded-lg cursor-pointer"
                    onClick={() => seekToTimestamp(transcription.timestamp)}
                  >
                    <span className="text-sm">{transcription.text}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(transcription.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>

      <VideoEditor 
        recordedBlob={currentBlob} 
        onSave={setEditedBlob}
      />
    </div>
  );
};