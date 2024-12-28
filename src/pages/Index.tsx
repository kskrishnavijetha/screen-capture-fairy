import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Video, StopCircle, MonitorPlay, Download, Pause, Play } from 'lucide-react';
import { CaptureModeSelector, type CaptureMode } from '@/components/CaptureModeSelector';

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [filename, setFilename] = useState('screen-recording');
  const [duration, setDuration] = useState(0);
  const [captureMode, setCaptureMode] = useState<CaptureMode>('screen');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setDuration(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getMediaConstraints = async () => {
    let stream: MediaStream | null = null;
    let audioStream: MediaStream | null = null;

    switch (captureMode) {
      case 'screen':
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: { displaySurface: 'monitor' },
          audio: true
        });
        break;
      case 'camera':
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        break;
      case 'both':
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { displaySurface: 'monitor' },
          audio: true
        });
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        const tracks = [...screenStream.getTracks(), ...cameraStream.getTracks()];
        stream = new MediaStream(tracks);
        break;
    }

    if (stream && audioStream) {
      const tracks = [...stream.getTracks(), ...audioStream.getTracks()];
      return new MediaStream(tracks);
    }

    return stream;
  };

  const startRecording = async () => {
    try {
      const stream = await getMediaConstraints();
      if (!stream) return;

      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        toast({
          title: "Recording completed",
          description: "Your recording is ready to download"
        });
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordedBlob(null);
      startTimer();
      toast({
        title: "Recording started",
        description: "Your recording has begun"
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start recording"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      resetTimer();
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      pauseTimer();
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
      startTimer();
      toast({
        title: "Recording resumed",
        description: "Your screen is being recorded again"
      });
    }
  };

  const downloadRecording = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.style.display = 'none';
      a.href = url;
      a.download = `${filename}.webm`;
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Download started",
        description: "Your recording is being downloaded"
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center space-y-6 w-full max-w-md">
        <h1 className="text-4xl font-bold mb-8">Screen Recorder</h1>
        
        <CaptureModeSelector 
          mode={captureMode} 
          onChange={setCaptureMode}
        />

        {isRecording && (
          <div className="text-xl font-mono text-primary">
            {formatTime(duration)}
          </div>
        )}

        <div className="space-y-4">
          {!isRecording ? (
            <Button 
              onClick={startRecording}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <MonitorPlay className="mr-2 h-5 w-5" />
              Start Recording
            </Button>
          ) : (
            <div className="space-y-2">
              {!isPaused ? (
                <Button 
                  onClick={pauseRecording}
                  variant="outline"
                  className="w-full"
                >
                  <Pause className="mr-2 h-5 w-5" />
                  Pause Recording
                </Button>
              ) : (
                <Button 
                  onClick={resumeRecording}
                  variant="outline"
                  className="w-full"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Resume Recording
                </Button>
              )}
              <Button 
                onClick={stopRecording}
                variant="destructive"
                className="w-full"
              >
                <StopCircle className="mr-2 h-5 w-5" />
                Stop Recording
              </Button>
            </div>
          )}
        </div>

        {recordedBlob && !isRecording && (
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Enter filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full"
            />
            <Button
              onClick={downloadRecording}
              variant="outline"
              className="w-full bg-green-500 text-white hover:bg-green-600"
            >
              <Download className="mr-2 h-5 w-5" />
              Download Recording
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
