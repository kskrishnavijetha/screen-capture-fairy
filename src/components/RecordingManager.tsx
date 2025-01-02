import React, { useRef, useEffect, useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { Resolution } from '@/types/recording';
import { CaptureMode } from '@/components/CaptureModeSelector';

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

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        stopMediaStream(streamRef.current);
      }
    };
  }, []);

  const getMediaStream = async (mode: CaptureMode, fps: number, res: Resolution): Promise<MediaStream | null> => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: mode !== 'screen',
        video: {
          width: { ideal: res.width },
          height: { ideal: res.height },
          frameRate: { ideal: fps }
        }
      };

      if (mode === 'screen') {
        return await navigator.mediaDevices.getDisplayMedia(constraints);
      } else if (mode === 'camera') {
        return await navigator.mediaDevices.getUserMedia(constraints);
      }
      return null;
    } catch (error) {
      console.error('Error getting media stream:', error);
      toast({
        variant: "destructive",
        title: "Stream error",
        description: "Failed to access media device. Please check permissions."
      });
      return null;
    }
  };

  const stopMediaStream = (stream: MediaStream | null) => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const startRecording = async () => {
    try {
      const stream = await getMediaStream(captureMode, frameRate, resolution);
      if (!stream) {
        throw new Error('Failed to get media stream');
      }

      streamRef.current = stream;
      chunksRef.current = [];
      
      const options = { 
        mimeType: 'video/webm;codecs=vp8,opus',
        videoBitsPerSecond: 2500000
      };
      
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        chunksRef.current = [];
        onRecordingStop(blob);
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        toast({
          variant: "destructive",
          title: "Recording error",
          description: "An error occurred during recording. Please try again."
        });
        stopRecording();
      };

      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
      setIsPaused(false);
      onRecordingStart();

      toast({
        title: "Recording started",
        description: "Your recording has begun"
      });
    } catch (error) {
      console.error('Recording error:', error);
      toast({
        variant: "destructive",
        title: "Recording failed",
        description: "Failed to start recording. Please try again."
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
        if (streamRef.current) {
          stopMediaStream(streamRef.current);
          streamRef.current = null;
        }
        setIsRecording(false);
        setIsPaused(false);
        toast({
          title: "Recording stopped",
          description: "Your recording has been saved"
        });
      } catch (error) {
        console.error('Stop recording error:', error);
        toast({
          variant: "destructive",
          title: "Stop failed",
          description: "Failed to stop recording. Please try again."
        });
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        toast({
          title: "Recording paused",
          description: "Your recording is paused"
        });
      } catch (error) {
        console.error('Pause recording error:', error);
        toast({
          variant: "destructive",
          title: "Pause failed",
          description: "Failed to pause recording"
        });
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      try {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        toast({
          title: "Recording resumed",
          description: "Your recording has resumed"
        });
      } catch (error) {
        console.error('Resume recording error:', error);
        toast({
          variant: "destructive",
          title: "Resume failed",
          description: "Failed to resume recording"
        });
      }
    }
  };

  return (
    <div className="hidden">
      <button id="start-recording" onClick={startRecording}>Start</button>
      <button id="stop-recording" onClick={stopRecording}>Stop</button>
      <button id="pause-recording" onClick={pauseRecording}>Pause</button>
      <button id="resume-recording" onClick={resumeRecording}>Resume</button>
    </div>
  );
};