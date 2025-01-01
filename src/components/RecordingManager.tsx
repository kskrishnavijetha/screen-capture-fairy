import React, { useEffect, useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { CaptureMode } from './CaptureModeSelector';
import { getMediaStream, stopMediaStream } from '@/utils/mediaUtils';
import { useRecordingState } from '@/hooks/useRecordingState';
import { CountdownTimer } from './CountdownTimer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [recordingDuration, setRecordingDuration] = useState<string>('0'); // in minutes
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      stopMediaStream(streamRef.current);
      if (recordingTimer) {
        clearTimeout(recordingTimer);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await getMediaStream(captureMode, frameRate, resolution);
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

      // Set up recording timer if duration is specified
      if (recordingDuration !== '0') {
        const durationMs = parseInt(recordingDuration) * 60 * 1000;
        const timer = setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            stopRecording();
            toast({
              title: "Recording completed",
              description: `Recording stopped after ${recordingDuration} minute(s)`
            });
          }
        }, durationMs);
        setRecordingTimer(timer);
      }
      
      toast({
        title: "Recording started",
        description: recordingDuration !== '0' 
          ? `Recording will stop after ${recordingDuration} minute(s)`
          : "Your recording has begun"
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
        if (recordingTimer) {
          clearTimeout(recordingTimer);
          setRecordingTimer(null);
        }
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

  const initiateRecording = () => {
    setShowCountdown(true);
  };

  return (
    <div>
      {!isRecording && (
        <div className="mb-4">
          <label className="text-sm font-medium block mb-2">
            Recording Duration (minutes)
          </label>
          <Select
            value={recordingDuration}
            onValueChange={setRecordingDuration}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">No limit</SelectItem>
              <SelectItem value="1">1 minute</SelectItem>
              <SelectItem value="5">5 minutes</SelectItem>
              <SelectItem value="10">10 minutes</SelectItem>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

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