import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Share2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { ShareControls } from '@/components/video/ShareControls';
import { useNavigate } from 'react-router-dom';

interface Recording {
  blob: Blob;
  timestamp: Date;
  id: string;
}

const LibraryPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = () => {
    try {
      const existingRecordings = localStorage.getItem('recordings');
      if (existingRecordings) {
        const parsedRecordings = JSON.parse(existingRecordings);
        const processedRecordings = parsedRecordings.map((recording: any) => ({
          ...recording,
          blob: new Blob([new Uint8Array(recording.blob)], { type: 'video/webm' }),
          timestamp: new Date(recording.timestamp)
        }));
        setRecordings(processedRecordings);
      }
    } catch (error) {
      console.error('Error loading recordings:', error);
      toast({
        variant: "destructive",
        title: "Error loading recordings",
        description: "Failed to load your recordings"
      });
    }
  };

  const handleEdit = (recording: Recording) => {
    navigate('/edit', { state: { recordedBlob: recording.blob } });
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

  return (
    <div className="min-h-screen p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Share your video</CardTitle>
          <p className="text-center text-muted-foreground">
            Easily copy the link or share your video via email
          </p>
        </CardHeader>
        <CardContent>
          {recordings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recordings found</p>
              <p className="text-sm">Your recorded videos will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recordings.map((recording, index) => (
                <Card key={recording.id || index} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div 
                        className="relative w-40 h-24 bg-black rounded cursor-pointer"
                        onClick={() => handlePreview(recording)}
                      >
                        <Video className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-white/50" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-2">
                          {format(recording.timestamp, 'PPpp')}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(recording)}
                            className="flex items-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Edit video
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedRecording(recording)}
                            className="flex items-center gap-2"
                          >
                            <Share2 className="h-4 w-4" />
                            Share video
                          </Button>
                        </div>
                      </div>
                    </div>
                    {selectedRecording?.id === recording.id && (
                      <div className="mt-4">
                        <ShareControls recordedBlob={recording.blob} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LibraryPage;