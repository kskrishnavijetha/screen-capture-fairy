import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Video, StopCircle, MonitorPlay, Download, Pause, Play } from 'lucide-react';

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [filename, setFilename] = useState('screen-recording');
  const [duration, setDuration] = useState(0);
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      // Get system audio
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      // Combine video and audio streams
      const tracks = [...stream.getTracks(), ...audioStream.getTracks()];
      const combinedStream = new MediaStream(tracks);

      const mediaRecorder = new MediaRecorder(combinedStream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: 'video/webm'
        });
        chunksRef.current = [];
        setRecordedBlob(blob);
        setIsRecording(false);
        resetTimer();
        toast({
          title: "Recording completed",
          description: "Your screen recording is ready to download"
        });
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordedBlob(null);
      startTimer();
      toast({
        title: "Recording started",
        description: "Your screen is now being recorded with audio"
      });

    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start screen recording"
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

        <p className="text-sm text-muted-foreground mt-4">
          {isRecording 
            ? isPaused 
              ? 'Recording is paused' 
              : 'Recording in progress...' 
            : recordedBlob 
              ? 'Recording complete! Enter a filename and click download to save.' 
              : 'Click start to begin recording your screen'}
        </p>
      </div>
    </div>
  );
};

export default Index;