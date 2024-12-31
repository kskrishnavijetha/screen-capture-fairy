import React, { useState } from 'react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface TranscriptionControlsProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onSeek: (time: number) => void;
}

interface Transcription {
  text: string;
  timestamp: number;
}

export const TranscriptionControls = ({ videoRef, onSeek }: TranscriptionControlsProps) => {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { toast } = useToast();

  const startTranscription = async () => {
    setIsTranscribing(true);
    try {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.continuous = true;
      recognition.interimResults = true;

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={startTranscription}
        variant="secondary"
        disabled={isTranscribing}
        className="w-full"
      >
        {isTranscribing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Transcribing...
          </>
        ) : (
          'Start Transcription'
        )}
      </Button>

      {transcriptions.length > 0 && (
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
      )}
    </div>
  );
};