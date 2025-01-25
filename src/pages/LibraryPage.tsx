import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface Recording {
  blob: Blob;
  timestamp: Date;
  id: string;
}

const LibraryPage = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = () => {
    try {
      const existingRecordings = localStorage.getItem('recordings');
      if (existingRecordings) {
        const parsedRecordings = JSON.parse(existingRecordings);
        const processedRecordings = parsedRecordings.map((recording: any) => ({
          blob: new Blob([new Uint8Array(recording.blob)], { type: 'video/webm' }),
          timestamp: new Date(recording.timestamp),
          id: recording.id
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

  const handleEdit = (recordingId: string) => {
    navigate(`/edit?id=${recordingId}`);
  };

  const handleShare = (recordingId: string) => {
    navigate(`/safeshare?id=${recordingId}`);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Library</h1>
        <p className="text-muted-foreground">View and manage your recordings</p>
      </div>

      {recordings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No recordings found. Start by creating a new recording!</p>
          <Button 
            className="mt-4"
            onClick={() => navigate('/recorder')}
          >
            Create Recording
          </Button>
        </div>
      ) : (
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
                    onClick={() => handleEdit(recording.id)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(recording.id)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LibraryPage;