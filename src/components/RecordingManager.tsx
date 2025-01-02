import React, { useEffect, useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { CaptureMode } from './CaptureModeSelector';
import { getMediaStream, stopMediaStream } from '@/utils/mediaUtils';
import { useRecordingState } from '@/hooks/useRecordingState';
import { CountdownTimer } from './CountdownTimer';

interface RecordingManagerProps {
  captureMode: CaptureMode;
  frameRate: number;
  resolution: {
    label: string;
    width: number;
    height: number;
  };
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
  resolution,
  onRecordingStart,
  onRecordingStop,
  isRecording,
  setIsRecording,
  setIsPaused,
  isPaused
}: RecordingManagerProps) => {
  const { mediaRecorderRef, chunksRef, streamRef } = useRecordingState();
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(3);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        stopMediaStream(streamRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await getMediaStream(captureMode, frameRate, resolution);
      if (!stream) {
        throw new Error('Failed to get media stream');
      }

      streamRef.current = stream;
      
      const options = { 
        mimeType: 'video/webm;codecs=vp8,opus',
        videoBitsPerSecond: 2500000
      };
      
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { 
            type: 'video/webm;codecs=vp8,opus' 
          });
          onRecordingStop(blob);
          toast({
            title: "Recording completed",
            description: "Your recording has been processed and is ready for download"
          });
        }
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
        description: "Your screen is now being recorded"
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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
        if (streamRef.current) {
          stopMediaStream(streamRef.current);
          streamRef.current = null;
        }
        setIsRecording(false);
        toast({
          title: "Recording stopped",
          description: "Processing your recording..."
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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
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

  const initiateRecording = () => {
    setShowCountdown(true);
  };

  return (
    <div>
      {showCountdown && (
        <CountdownTimer
          seconds={countdownSeconds}
          onComplete={() => {
            setShowCountdown(false);
            startRecording();
          }}
          onCancel={() => {
            setShowCountdown(false);
            toast({
              title: "Cancelled",
              description: "Recording countdown was cancelled"
            });
          }}
        />
      )}
      <div className="hidden">
        <button onClick={initiateRecording} id="start-recording" />
        <button onClick={stopRecording} id="stop-recording" />
        <button onClick={pauseRecording} id="pause-recording" />
        <button onClick={resumeRecording} id="resume-recording" />
      </div>
    </div>
  );
};