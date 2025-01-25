import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

interface Recording {
  blob: Blob;
  timestamp: Date;
  id: string;
}

const LibraryPage = () => {
  const { toast } = useToast();
  const [recordings, setRecordings] = useState<Recording[]>([]);

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

  const handleDownload = (blob: Blob) => {
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
    <div className="min-h-screen p-8">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Video className="h-6 w-6" />
            My Recordings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recordings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recordings found</p>
              <p className="text-sm">Your recorded videos will appear here</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recordings.map((recording, index) => (
                <Card key={recording.id || index} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">
                        {format(recording.timestamp, 'PPpp')}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handlePreview(recording)}
                      >
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleDownload(recording.blob)}
                      >
                        Download
                      </Button>
                    </div>
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