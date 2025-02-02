import React, { useEffect, useRef } from 'react';
import { toast } from "@/components/ui/use-toast";
import { CaptureMode } from './CaptureModeSelector';

interface RecordingManagerProps {
  captureMode: CaptureMode;
  frameRate: number;
  resolution: { width: number; height: number; label: string };
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
  const previewRef = useRef<HTMLVideoElement>(null);

  const startRecording = async () => {
    try {
      const displayMediaOptions = {
        video: {
          frameRate: { ideal: frameRate },
          width: { ideal: resolution.width },
          height: { ideal: resolution.height }
        },
        audio: true
      };

      let stream: MediaStream;
      
      if (captureMode === 'screen') {
        stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      } else if (captureMode === 'camera') {
        stream = await navigator.mediaDevices.getUserMedia({
          video: displayMediaOptions.video,
          audio: true
        });
      } else {
        // Both screen and camera
        const screenStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        const tracks = [...screenStream.getTracks(), ...cameraStream.getTracks()];
        stream = new MediaStream(tracks);
      }

      // Set the stream to the preview video element
      if (previewRef.current) {
        previewRef.current.srcObject = stream;
        previewRef.current.play().catch(console.error);
      }

      streamRef.current = stream;
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        onRecordingStop(blob);
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        // Clear the preview
        if (previewRef.current) {
          previewRef.current.srcObject = null;
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000);
      setIsRecording(true);
      setIsPaused(false);
      onRecordingStart();

      toast({
        title: "Recording started",
        description: "Your screen recording has begun"
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        variant: "destructive",
        title: "Recording failed",
        description: "Failed to start recording. Please check permissions."
      });
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
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

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return (
    <div>
      <div className="hidden">
        <button id="start-recording" onClick={startRecording}>Start</button>
        <button id="stop-recording" onClick={stopRecording}>Stop</button>
        <button id="pause-recording" onClick={togglePause}>
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      </div>
      <video
        ref={previewRef}
        className="w-full aspect-video bg-black rounded-lg"
        autoPlay
        playsInline
        muted
      />
    </div>
  );
};