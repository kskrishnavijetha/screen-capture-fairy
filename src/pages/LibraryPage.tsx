import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Share2, Plus, Library, Search } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { supabase } from '@/integrations/supabase/client';

interface Recording {
  blob: Blob;
  timestamp: Date;
  id: string;
}

export const LibraryPage = () => {
  const navigate = useNavigate();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

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
        title: "Error",
        description: "Failed to load recordings",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/edit?id=${id}`);
  };

  const handleShare = (id: string) => {
    navigate(`/safeshare?id=${id}`);
  };

  const filteredRecordings = recordings.filter(recording => 
    format(recording.timestamp, 'PPpp').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Library className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">My Library</h1>
              <p className="text-muted-foreground">Manage your recordings</p>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/recorder')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Recording
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recordings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredRecordings.length === 0 ? (
          <div className="text-center py-12 bg-muted/50 rounded-lg">
            <Library className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No recordings found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'No recordings match your search' : 'Start by creating a new recording'}
            </p>
            {!searchQuery && (
              <Button 
                onClick={() => navigate('/recorder')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Recording
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecordings.map((recording) => (
              <Card key={recording.id} className="overflow-hidden">
                <div className="aspect-video bg-black">
                  <video
                    src={URL.createObjectURL(recording.blob)}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    {format(recording.timestamp, 'PPpp')}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(recording.id)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
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
    </div>
  );
};

export default LibraryPage;