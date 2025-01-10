import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MessageCircle, X, ArrowLeft, Scissors, Download, Clock } from 'lucide-react';
import { cn } from "@/lib/utils";
import { VideoEditor } from '@/components/VideoEditor';
import { toast } from "@/hooks/use-toast";
import { format } from 'date-fns';

interface VideoPlaybackProps {
  recordedBlob?: Blob;
}

interface Recording {
  blob: Blob;
  timestamp: Date;
  id: string;
}

const VideoPlayback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { recordedBlob } = location.state as VideoPlaybackProps;
  const [showSidebar, setShowSidebar] = useState(true);
  const [removeSilences, setRemoveSilences] = useState(false);
  const [removeFillerWords, setRemoveFillerWords] = useState(false);
  const [previousRecordings, setPreviousRecordings] = useState<Recording[]>([]);
  const [currentRecordingTime] = useState(new Date());

  useEffect(() => {
    // Get existing recordings from localStorage
    const existingRecordings = localStorage.getItem('recordings');
    const parsedRecordings = existingRecordings ? JSON.parse(existingRecordings) : [];
    setPreviousRecordings(parsedRecordings);

    // Add new recording if exists
    if (recordedBlob) {
      const newRecording: Recording = {
        blob: recordedBlob,
        timestamp: currentRecordingTime,
        id: Date.now().toString()
      };

      const updatedRecordings = [newRecording, ...parsedRecordings];
      localStorage.setItem('recordings', JSON.stringify(updatedRecordings));
      setPreviousRecordings(updatedRecordings);
    }
  }, [recordedBlob, currentRecordingTime]);

  const handleBack = () => {
    navigate('/');
  };

  const handleDownload = (blob: Blob = recordedBlob!) => {
    if (!blob) {
      toast({
        variant: "destructive",
        title: "Download error",
        description: "No recording available to download"
      });
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `recording-${Date.now()}.webm`;
    
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);

    toast({
      title: "Download started",
      description: "Your recording is being downloaded"
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Button
        variant="ghost"
        className="absolute top-4 left-4 p-2"
        onClick={handleBack}
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>

      <div className={cn(
        "flex-1 p-6 transition-all duration-300",
        showSidebar ? "mr-[400px]" : "mr-0"
      )}>
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Recorded on {format(currentRecordingTime, 'PPpp')}
            </span>
          </div>
          
          <video
            src={recordedBlob ? URL.createObjectURL(recordedBlob) : ''}
            controls
            className="w-full rounded-lg bg-black mb-6"
          />
          <div className="flex gap-4">
            <Button 
              onClick={() => navigate('/edit', { state: { recordedBlob } })}
              className="flex-1 items-center justify-center"
            >
              <Scissors className="h-4 w-4 mr-2" />
              Edit Video
            </Button>
            <Button
              onClick={() => handleDownload()}
              variant="outline"
              className="flex-1 items-center justify-center bg-green-500 text-white hover:bg-green-600"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Recording
            </Button>
          </div>

          {previousRecordings.length > 1 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Previous Recordings</h3>
              <div className="space-y-4">
                {previousRecordings.slice(1).map((recording) => (
                  <Card key={recording.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(recording.timestamp), 'PPpp')}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(recording.blob)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={cn(
        "fixed right-0 top-0 h-full w-[400px] border-l border-border bg-card transition-transform duration-300",
        showSidebar ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold">Options</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowSidebar(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between space-x-4">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Remove silences</div>
                <div className="text-xs text-muted-foreground">
                  Automatically remove silent parts of the video
                </div>
              </div>
              <Switch
                checked={removeSilences}
                onCheckedChange={setRemoveSilences}
              />
            </div>

            <div className="flex items-center justify-between space-x-4">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Remove filler words</div>
                <div className="text-xs text-muted-foreground">
                  Remove common filler words from the video
                </div>
              </div>
              <Switch
                checked={removeFillerWords}
                onCheckedChange={setRemoveFillerWords}
              />
            </div>
          </div>
        </div>
      </div>

      {!showSidebar && (
        <Button
          className="fixed right-6 top-6"
          onClick={() => setShowSidebar(true)}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Options
        </Button>
      )}
    </div>
  );
};

export default VideoPlayback;