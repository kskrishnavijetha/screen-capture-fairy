import React, { useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { CaptureMode } from './CaptureModeSelector';
import { getMediaStream, stopMediaStream } from '@/utils/mediaUtils';
import { useRecordingState } from '@/hooks/useRecordingState';

interface RecordingManagerProps {
  captureMode: CaptureMode;
  frameRate: number;
  onRecordingStart: () => void;
  onRecordingStop: (blob: Blob) => void;
  isRecording: boolean;
  setIsRecording: (value: boolean) => void;
  setIsPaused: (value: boolean) => void;
  isPaused: boolean;
}

export const RecordingManager = ({
  captureMode,
  frameRate,
  onRecordingStart,
  onRecordingStop,
  isRecording,
  setIsRecording,
  setIsPaused,
  isPaused
}: RecordingManagerProps) => {
  const { mediaRecorderRef, chunksRef, streamRef } = useRecordingState();

  useEffect(() => {
    return () => {
      stopMediaStream(streamRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await getMediaStream(captureMode, frameRate);
      streamRef.current = stream;
      
      const options = { mimeType: 'video/webm;codecs=vp8,opus' };
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          onRecordingStop(blob);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      onRecordingStart();
      
      toast({
        title: "Recording started",
        description: "Your recording has begun"
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start recording. Please ensure you have granted the necessary permissions."
      });
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
        stopMediaStream(streamRef.current);
        streamRef.current = null;
        setIsRecording(false);
        toast({
          title: "Recording stopped",
          description: "Your recording has been saved"
        });
      } catch (error) {
        console.error('Error stopping recording:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to stop recording properly."
        });
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      try {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        toast({
          title: "Recording paused",
          description: "Click resume to continue recording"
        });
      } catch (error) {
        console.error('Error pausing recording:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to pause recording."
        });
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      try {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        toast({
          title: "Recording resumed",
          description: "Your screen is being recorded again"
        });
      } catch (error) {
        console.error('Error resuming recording:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to resume recording."
        });
      }
    }
  };

  return {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording
  };
};