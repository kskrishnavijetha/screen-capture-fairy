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
  isRecording,
  setIsRecording,
  isPaused,
  setIsPaused,
}) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const cleanup = () => {
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;
    }
    if (streamRef.current) {
      stopMediaStream(streamRef.current);
      streamRef.current = null;
    }
    chunksRef.current = [];
  };

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const startRecording = async () => {
    try {
      cleanup(); // Clean up any existing recordings
      
      // Get the media stream with both video and audio
      const stream = await getMediaStream(captureMode, frameRate, resolution);
      if (!stream) {
        throw new Error('Failed to get media stream');
      }

      // Verify audio tracks are present
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        // Try to get microphone access separately
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          });
          audioTracks.push(...audioStream.getAudioTracks());
          // Combine the audio tracks with the existing stream
          stream.addTrack(audioStream.getAudioTracks()[0]);
        } catch (audioError) {
          console.error('Failed to get audio stream:', audioError);
          toast({
            title: "Audio Issue",
            description: "Please ensure microphone access is granted for audio recording.",
            variant: "destructive"
          });
          return;
        }
      }

      streamRef.current = stream;
      chunksRef.current = [];

      const options = {
        mimeType: 'video/webm;codecs=vp8,opus',
        audioBitsPerSecond: 128000,
        videoBitsPerSecond: 2500000
      };

      mediaRecorderRef.current = new MediaRecorder(stream, options);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        onRecordingStop(blob);
        cleanup();
      };

      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
      setIsPaused(false);
      onRecordingStart();

      toast({
        title: "Recording started",
        description: "Your recording has begun with audio enabled"
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      cleanup();
      setIsRecording(false);
      setIsPaused(false);
      
      toast({
        title: "Recording Error",
        description: "Failed to start recording. Please check microphone permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const togglePause = () => {
    if (!mediaRecorderRef.current) return;

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