import React, { useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { TimestampSection } from './media/TimestampSection';
import { TranscriptionSection } from './media/TranscriptionSection';
import { VideoPreview } from './media/VideoPreview';
import { EditingSection } from './media/EditingSection';
import { Timestamp, Transcription } from '@/types/media';

interface MediaPlayerProps {
  recordedBlob: Blob | null;
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
        description: `Added timestamp "${label}" at ${currentTime.toFixed(2)}s`,
      });
    }
  };

  const seekToTimestamp = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play().catch(error => {
        console.error('Error playing video:', error);
        toast({
          variant: "destructive",
          title: "Playback Error",
          description: "Could not play the video at the selected timestamp.",
        });
      });
    }
  };

  const startTranscription = async () => {
    if (!currentBlob) return;

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
        setIsTranscribing(false);
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
        <VideoPreview 
          videoUrl={videoUrl}
          videoRef={videoRef}
          onAddTimestamp={addTimestamp}
          onStartTranscription={startTranscription}
          isTranscribing={isTranscribing}
          onDownload={editedBlob ? () => {
            const url = URL.createObjectURL(editedBlob);
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
          } : undefined}
        />

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

        <EditingSection 
          currentBlob={currentBlob}
          timestamps={timestamps}
          onSave={setEditedBlob}
        />
      </div>
    </div>
  );
};