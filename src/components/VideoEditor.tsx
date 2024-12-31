import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/components/ui/use-toast";
import { Scissors } from 'lucide-react';

interface VideoEditorProps {
  recordedBlob: Blob | null;
  onSave: (newBlob: Blob) => void;
}

export const VideoEditor = ({ recordedBlob, onSave }: VideoEditorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [trimRange, setTrimRange] = useState([0, 100]);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (videoRef.current && recordedBlob) {
      videoRef.current.src = URL.createObjectURL(recordedBlob);
      videoRef.current.onloadedmetadata = () => {
        setDuration(videoRef.current?.duration || 0);
      };
    }
  }, [recordedBlob]);

  const handleTrimRangeChange = (newRange: number[]) => {
    setTrimRange(newRange);
    if (videoRef.current) {
      videoRef.current.currentTime = (newRange[0] / 100) * duration;
    }
  };

  const handleTrim = async () => {
    if (!recordedBlob || !videoRef.current) return;

    try {
      const startTime = (trimRange[0] / 100) * duration;
      const endTime = (trimRange[1] / 100) * duration;

      const mediaStream = (videoRef.current as any).captureStream();
      const mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: recordedBlob.type,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const newBlob = new Blob(chunks, { type: recordedBlob.type });
        onSave(newBlob);
        toast({
          title: "Video trimmed successfully",
          description: "Your video has been trimmed according to the selected range.",
        });
      };

      videoRef.current.currentTime = startTime;
      mediaRecorder.start();
      videoRef.current.play();

      setTimeout(() => {
        mediaRecorder.stop();
        videoRef.current!.pause();
      }, (endTime - startTime) * 1000);
    } catch (error) {
      toast({
        title: "Error trimming video",
        description: "There was an error while trimming your video. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!recordedBlob) return null;

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto mt-6">
      <div className="relative rounded-lg overflow-hidden bg-black">
        <video
          ref={videoRef}
          className="w-full"
          controls
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Trim Video</h3>
        <Slider
          value={trimRange}
          onValueChange={handleTrimRangeChange}
          max={100}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{formatTime((trimRange[0] / 100) * duration)}</span>
          <span>{formatTime((trimRange[1] / 100) * duration)}</span>
        </div>
      </div>

      <Button onClick={handleTrim} className="w-full">
        <Scissors className="w-4 h-4 mr-2" />
        Trim Video
      </Button>
    </div>
  );
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};