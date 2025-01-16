import { useState, useRef, useCallback } from 'react';
import { toast } from "@/hooks/use-toast";
import { getMediaStream, stopMediaStream } from '@/utils/mediaStreamUtils';
import { Resolution } from '@/types/recording';
import { CaptureMode } from '@/components/CaptureModeSelector';

export const useRecordingState = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const getMimeType = () => {
    const types = [
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4',
      'video/x-matroska;codecs=avc1',
      'video/webm;codecs=h264',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    
    return 'video/webm'; // Fallback
  };

  const startRecording = useCallback(async (
    captureMode: CaptureMode,
    frameRate: number,
    resolution: Resolution,
    onRecordingStart: () => void,
    onRecordingStop: (blob: Blob) => void,
  ) => {
    try {
      // Clean up any existing streams
      if (streamRef.current) {
        stopMediaStream(streamRef.current);
        streamRef.current = null;
      }

      // Initialize new stream
      const stream = await getMediaStream(captureMode, frameRate, resolution);
      if (!stream) {
        throw new Error('Failed to initialize media stream');
      }

      // Verify we have the necessary tracks
      if (stream.getTracks().length === 0) {
        throw new Error('No media tracks available');
      }

      streamRef.current = stream;
      chunksRef.current = [];

      const options = {
        mimeType: getMimeType(),
        videoBitsPerSecond: isMobileDevice() ? 1500000 : 2500000 // Lower bitrate for mobile
      };

      try {
        mediaRecorderRef.current = new MediaRecorder(stream, options);
      } catch (e) {
        console.error('MediaRecorder error:', e);
        // Try fallback options if initial creation fails
        try {
          mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
        } catch (fallbackError) {
          console.error('Fallback MediaRecorder error:', fallbackError);
          throw new Error('Your browser does not support screen recording. Please try using a different browser.');
        }
      }

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const mimeType = getMimeType();
        const blob = new Blob(chunksRef.current, { type: mimeType });
        chunksRef.current = [];
        onRecordingStop(blob);
        if (streamRef.current) {
          stopMediaStream(streamRef.current);
          streamRef.current = null;
        }
      };

      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
      setIsPaused(false);
      onRecordingStart();

      toast({
        title: "Recording started",
        description: isMobileDevice() 
          ? "Recording started. Note: Some mobile devices may have limited screen recording capabilities."
          : "Your recording has begun"
      });
    } catch (error) {
      console.error('Recording error:', error);
      setIsRecording(false);
      setIsPaused(false);
      if (streamRef.current) {
        stopMediaStream(streamRef.current);
        streamRef.current = null;
      }
      toast({
        variant: "destructive",
        title: "Recording failed",
        description: error instanceof Error ? error.message : "Failed to start recording"
      });
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        stopMediaStream(streamRef.current);
        streamRef.current = null;
      }
      setIsRecording(false);
      setIsPaused(false);
    }
  }, []);

  const togglePause = useCallback(() => {
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
  }, []);

  return {
    isRecording,
    isPaused,
    startRecording,
    stopRecording,
    togglePause
  };
};