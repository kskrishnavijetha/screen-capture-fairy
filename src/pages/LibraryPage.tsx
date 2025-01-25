import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Download, Calendar } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface Recording {
  blob: Blob;
  timestamp: Date;
  id: string;
}

export default function LibraryPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const { toast } = useToast();

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
    const url = URL.createObjectURL(recording.blob);
    window.open(url, '_blank');
  };

  const handleDownload = (recording: Recording) => {
    const url = URL.createObjectURL(recording.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "Your recording is being downloaded"
    });
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">My Library</h1>
      
      {recordings.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          <p>No recordings found. Start recording to see them here!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recordings.map((recording, index) => (
            <Card key={recording.id || index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Calendar className="h-4 w-4" />
                  <span>{format(recording.timestamp, 'PPpp')}</span>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => handlePreview(recording)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDownload(recording)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}