import React, { useEffect, useRef } from 'react';
import { getMediaStream, stopMediaStream } from '@/utils/mediaStreamUtils';
import { CaptureMode } from '@/components/CaptureModeSelector';
import { Resolution } from '@/types/recording';
import { toast } from "@/components/ui/use-toast";

interface RecordingManagerProps {
  captureMode: CaptureMode;
  frameRate: number;
  resolution: Resolution;
  onRecordingStart: () => void;
  onRecordingStop: (blob: Blob) => void;
  onAudioStreamReady?: (stream: MediaStream) => void;
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
  isPaused: boolean;
  setIsPaused: (isPaused: boolean) => void;
}

export const RecordingManager: React.FC<RecordingManagerProps> = ({
  captureMode,
  frameRate,
  resolution,
  onRecordingStart,
  onRecordingStop,
  onAudioStreamReady,
  isRecording,
  setIsRecording,
  isPaused,
  setIsPaused,
}) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);

  const cleanup = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;

      if (streamRef.current) {
        stopMediaStream(streamRef.current);
        streamRef.current = null;
      }

      if (audioStreamRef.current) {
        stopMediaStream(audioStreamRef.current);
        audioStreamRef.current = null;
      }

      chunksRef.current = [];
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  };

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const startRecording = async () => {
    try {
      cleanup();
      
      console.log('Starting recording with mode:', captureMode);
      const stream = await getMediaStream(captureMode, frameRate, resolution);
      
      if (!stream) {
        throw new Error('Failed to get media stream');
      }

      // Get audio stream for captions
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ 
          audio: true,
          video: false
        });
        audioStreamRef.current = audioStream;
        if (onAudioStreamReady) {
          onAudioStreamReady(audioStream);
        }
      } catch (audioError) {
        console.error('Error accessing microphone:', audioError);
        toast({
          variant: "destructive",
          title: "Microphone Access Error",
          description: "Failed to access microphone for captions. Please check permissions."
        });
      }
      
      console.log('Got media stream:', stream.getTracks().map(t => t.kind));
      streamRef.current = stream;
      chunksRef.current = [];

      const options = {
        mimeType: 'video/webm;codecs=vp8,opus',
        audioBitsPerSecond: 128000,
        videoBitsPerSecond: 2500000
      };

      mediaRecorderRef.current = new MediaRecorder(stream, options);
      console.log('MediaRecorder created:', mediaRecorderRef.current.state);

      mediaRecorderRef.current.ondataavailable = (event) => {
        console.log('Data available:', event.data?.size);
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        console.log('Recording stopped, chunks:', chunksRef.current.length);
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        onRecordingStop(blob);
        cleanup();
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        cleanup();
        toast({
          variant: "destructive",
          title: "Recording error",
          description: "Failed to record. Please try again."
        });
      };

      mediaRecorderRef.current.start(1000);
      console.log('Recording started');
      setIsRecording(true);
      setIsPaused(false);
      onRecordingStart();

      toast({
        title: "Recording started",
        description: "Your recording has begun"
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      cleanup();
      setIsRecording(false);
      setIsPaused(false);
      toast({
        variant: "destructive",
        title: "Recording failed",
        description: error instanceof Error ? error.message : "Failed to start recording"
      });
    }
  };

  const stopRecording = () => {
    console.log('Stopping recording...');
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const togglePause = () => {
    if (!mediaRecorderRef.current) return;

    try {
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        toast({
          title: "Recording paused",
          description: "Your recording is paused"
        });
      } else if (mediaRecorderRef.current.state === 'paused') {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        toast({
          title: "Recording resumed",
          description: "Your recording has resumed"
        });
      }
    } catch (error) {
      console.error('Error toggling pause:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to pause/resume recording"
      });
    }
  };

  return (
    <div className="hidden">
      <button id="start-recording" onClick={startRecording}>Start</button>
      <button id="stop-recording" onClick={stopRecording}>Stop</button>
      <button id="pause-recording" onClick={togglePause}>
        {isPaused ? 'Resume' : 'Pause'}
      </button>
    </div>
  );
};