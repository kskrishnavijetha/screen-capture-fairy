import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, ArrowLeft, Download, Clock, Trash2, Share2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { VideoEditor } from '@/components/VideoEditor';
import { toast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { ShareControls } from '@/components/video/ShareControls';

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
  const { recordedBlob } = (location.state || {}) as VideoPlaybackProps;
  const [showSidebar, setShowSidebar] = useState(true);
  const [previousRecordings, setPreviousRecordings] = useState<Recording[]>([]);
  const [currentRecordingTime] = useState(new Date());
  const [selectedRecording, setSelectedRecording] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showShareControls, setShowShareControls] = useState(false);

  useEffect(() => {
    const loadRecordings = async () => {
      if (!recordedBlob && !location.state) {
        navigate('/');
        return;
      }

      const existingRecordings = localStorage.getItem('recordings');
      let parsedRecordings: Recording[] = [];
      
      try {
        if (existingRecordings) {
          const storedRecordings = JSON.parse(existingRecordings);
          const parsePromises = storedRecordings.map(async (recording: any) => {
            try {
              const blobData = Array.isArray(recording.blob) 
                ? new Uint8Array(recording.blob)
                : recording.blob;
              
              const blob = new Blob([blobData], { type: 'video/webm' });
              
              if (blob.size === 0) {
                console.error('Invalid blob size');
                return null;
              }

              return {
                ...recording,
                blob,
                timestamp: new Date(recording.timestamp)
              };
            } catch (error) {
              console.error('Error parsing individual recording:', error);
              return null;
            }
          });

          parsedRecordings = (await Promise.all(parsePromises)).filter(Boolean) as Recording[];
        }
      } catch (error) {
        console.error('Error parsing recordings:', error);
        toast({
          variant: "destructive",
          title: "Error loading recordings",
          description: "Failed to load previous recordings"
        });
      }
      
      setPreviousRecordings(parsedRecordings);

      if (recordedBlob) {
        try {
          if (!(recordedBlob instanceof Blob) || recordedBlob.size === 0) {
            throw new Error('Invalid recording data');
          }

          const newRecording: Recording = {
            blob: recordedBlob,
            timestamp: currentRecordingTime,
            id: Date.now().toString()
          };

          const updatedRecordings = [newRecording, ...parsedRecordings];
          
          const processedRecordings = await Promise.all(updatedRecordings.map(async (recording) => {
            const arrayBuffer = await recording.blob.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            const chunks: number[] = [];
            
            const chunkSize = 512 * 1024;
            for (let i = 0; i < uint8Array.length; i += chunkSize) {
              const chunk = Array.from(uint8Array.slice(i, i + chunkSize));
              chunks.push(...chunk);
            }
            
            return {
              ...recording,
              blob: chunks,
              timestamp: recording.timestamp.toISOString()
            };
          }));

          if (previousRecordings.length > 10) {
            const oldRecordings = JSON.parse(localStorage.getItem('recordings') || '[]');
            oldRecordings.pop();
            localStorage.setItem('recordings', JSON.stringify(oldRecordings));
          }

          localStorage.setItem('recordings', JSON.stringify(processedRecordings));
          setPreviousRecordings(updatedRecordings);
          
          toast({
            title: "Recording saved",
            description: "Your recording has been saved successfully"
          });
        } catch (error) {
          console.error('Storage error:', error);
          toast({
            variant: "destructive",
            title: "Storage error",
            description: error instanceof Error ? error.message : "Failed to save recording"
          });
        }
      }
    };

    loadRecordings();
  }, [recordedBlob, currentRecordingTime, location.state, navigate]);

  useEffect(() => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }

    const blobToUse = selectedRecording || recordedBlob;
    if (blobToUse) {
      const url = URL.createObjectURL(blobToUse);
      setVideoUrl(url);
    }

    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [selectedRecording, recordedBlob]);

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

  const handleEditVideo = () => {
    setShowShareControls(true);
  };

  const handlePreview = (recording: Recording) => {
    try {
      const url = URL.createObjectURL(recording.blob);
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Recording Preview</title>
              <style>
                body { 
                  margin: 0; 
                  background: black; 
                  display: flex; 
                  justify-content: center; 
                  align-items: center; 
                  height: 100vh; 
                }
                video { 
                  max-width: 100%; 
                  max-height: 100vh; 
                }
              </style>
            </head>
            <body>
              <video controls autoplay>
                <source src="${url}" type="video/webm">
                Your browser does not support the video tag.
              </video>
              <script>
                window.onunload = function() {
                  URL.revokeObjectURL("${url}");
                };
              </script>
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    } catch (error) {
      console.error('Error previewing recording:', error);
      toast({
        variant: "destructive",
        title: "Preview error",
        description: "Failed to preview the recording"
      });
    }
  };

  const handleDeleteRecording = async (recordingId: string) => {
    try {
      const updatedRecordings = previousRecordings.filter(rec => rec.id !== recordingId);
      
      const recordingsToStore = await Promise.all(updatedRecordings.map(async (recording) => {
        const arrayBuffer = await recording.blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        return {
          ...recording,
          blob: Array.from(uint8Array),
          timestamp: recording.timestamp.toISOString()
        };
      }));
      
      localStorage.setItem('recordings', JSON.stringify(recordingsToStore));
      setPreviousRecordings(updatedRecordings);
      
      toast({
        title: "Recording deleted",
        description: "The recording has been removed from your history"
      });
    } catch (error) {
      console.error('Error deleting recording:', error);
      toast({
        variant: "destructive",
        title: "Error deleting recording",
        description: "Failed to delete the recording"
      });
    }
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
          
          {videoUrl && (
            <video
              src={videoUrl}
              controls
              className="w-full rounded-lg bg-black mb-6"
            />
          )}

          <div className="flex gap-4">
            <Button 
              onClick={handleEditVideo}
              className="flex-1 items-center justify-center"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Edit Video
            </Button>
            <Button
              onClick={() => handleDownload(selectedRecording || recordedBlob)}
              variant="outline"
              className="flex-1 items-center justify-center bg-green-500 text-white hover:bg-green-600"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Recording
            </Button>
          </div>

          {showShareControls && (
            <Card className="p-4 mt-4">
              <ShareControls recordedBlob={selectedRecording || recordedBlob} />
            </Card>
          )}

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
                          {format(recording.timestamp, 'PPpp')}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(recording)}
                        >
                          Preview
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(recording.blob)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteRecording(recording.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayback;
