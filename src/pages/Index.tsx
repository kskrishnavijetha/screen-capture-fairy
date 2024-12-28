import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Video, StopCircle } from 'lucide-react';

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
        },
        audio: true
      });

      const mediaRecorder = new MediaRecorder(stream);
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
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        a.href = url;
        a.download = 'screen-recording.webm';
        a.click();
        
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setIsRecording(false);
        toast({
          title: "Recording saved",
          description: "Your screen recording has been downloaded"
        });
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast({
        title: "Recording started",
        description: "Your screen is now being recorded"
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
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold mb-8">Screen Recorder</h1>
        <div className="space-x-4">
          {!isRecording ? (
            <Button 
              onClick={startRecording}
              className="bg-primary hover:bg-primary/90"
            >
              <Video className="mr-2 h-4 w-4" />
              Start Recording
            </Button>
          ) : (
            <Button 
              onClick={stopRecording}
              variant="destructive"
            >
              <StopCircle className="mr-2 h-4 w-4" />
              Stop Recording
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          {isRecording ? 'Recording in progress...' : 'Click start to begin recording your screen'}
        </p>
      </div>
    </div>
  );
};

export default Index;