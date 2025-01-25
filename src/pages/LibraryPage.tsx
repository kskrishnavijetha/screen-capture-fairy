import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from "@/components/ui/use-toast";

interface Recording {
  blob: Blob;
  timestamp: Date;
  id: string;
}

export const LibraryPage = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = () => {
    try {
      const existingRecordings = localStorage.getItem('recordings');
      console.log('Raw recordings from storage:', existingRecordings); // Debug log
      
      if (existingRecordings) {
        const parsedRecordings = JSON.parse(existingRecordings);
        console.log('Parsed recordings:', parsedRecordings); // Debug log
        
        const processedRecordings = parsedRecordings.map((recording: any) => ({
          blob: new Blob([new Uint8Array(recording.blob)], { type: 'video/webm' }),
          timestamp: new Date(recording.timestamp),
          id: recording.id
        }));
        
        console.log('Processed recordings:', processedRecordings); // Debug log
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

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Share your video</h1>
        <p className="text-muted-foreground">Share your recordings via link or email</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recordings.map((recording) => (
          <Card key={recording.id} className="p-4">
            <div className="aspect-video mb-4 bg-black rounded-lg overflow-hidden">
              <video
                src={URL.createObjectURL(recording.blob)}
                controls
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">
                  {format(recording.timestamp, 'PPpp')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/edit/${recording.id}`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/share/${recording.id}`)}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};