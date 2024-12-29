import React, { useState, useRef, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { CaptureMode } from './CaptureModeSelector';

interface RecordingManagerProps {
  captureMode: CaptureMode;
  onRecordingStart: () => void;
  onRecordingStop: (blob: Blob) => void;
  isRecording: boolean;
  setIsRecording: (value: boolean) => void;
  setIsPaused: (value: boolean) => void;
  isPaused: boolean;
}

export const RecordingManager = ({
  captureMode,
  onRecordingStart,
  onRecordingStop,
  isRecording,
  setIsRecording,
  setIsPaused,
  isPaused
}: RecordingManagerProps) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const getMediaConstraints = async () => {
    try {
      let stream: MediaStream | null = null;

      switch (captureMode) {
        case 'screen':
          stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
            }
          });
          break;
        case 'camera':
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
            }
          });
          break;
        case 'both':
          const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
            }
          });
          const cameraStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
            }
          });
          const tracks = [...screenStream.getTracks(), ...cameraStream.getTracks()];
          stream = new MediaStream(tracks);
          break;
      }

      return stream;
    } catch (error) {
      console.error('Error getting media stream:', error);
      throw error;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await getMediaConstraints();
      if (!stream) {
        throw new Error('Failed to get media stream');
      }

      const options = { mimeType: 'video/webm;codecs=vp8,opus' };
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        onRecordingStop(blob);
        stream.getTracks().forEach(track => track.stop());
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
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      toast({
        title: "Recording stopped",
        description: "Your recording has been saved"
      });
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      toast({
        title: "Recording paused",
        description: "Click resume to continue recording"
      });
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      toast({
        title: "Recording resumed",
        description: "Your screen is being recorded again"
      });
    }
  };

  return {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording
  };
};