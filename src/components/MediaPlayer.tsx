import React, { useRef, useState } from 'react';
import { VideoEditor } from './VideoEditor';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download } from 'lucide-react';
import { TimestampSection } from './media/TimestampSection';
import { TranscriptionSection } from './media/TranscriptionSection';
import { formatTime } from '@/utils/timeUtils';

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
  const [editedBlob, setEditedBlob] = useState<Blob | null>(null);
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

  const seekToTimestamp = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  const downloadVideo = () => {
    if (!currentBlob) return;
    
    const url = URL.createObjectURL(currentBlob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = url;
    a.download = `edited_recording_${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast({
      title: "Download started",
      description: "Your edited video is being downloaded"
    });
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
          <TimestampSection 
            timestamps={timestamps}
            onSeek={seekToTimestamp}
          />
          <TranscriptionSection 
            transcriptions={transcriptions}
            onSeek={seekToTimestamp}
          />
        </div>
      </div>

      <VideoEditor 
        recordedBlob={currentBlob} 
        onSave={(newBlob) => {
          setEditedBlob(newBlob);
          downloadVideo();
        }}
      />
    </div>
  );
};
