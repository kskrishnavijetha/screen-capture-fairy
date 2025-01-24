import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Settings, LogOut, Video, ArrowLeft } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';

interface Recording {
  blob: Blob;
  timestamp: Date;
  id: string;
}

const UserPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [showRecordings, setShowRecordings] = useState(false);

  useEffect(() => {
    if (showRecordings) {
      loadRecordings();
    }
  }, [showRecordings]);

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

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/signin');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message
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
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">User Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => navigate('/profile')}
          >
            <User className="mr-2 h-4 w-4" />
            Profile
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setShowRecordings(!showRecordings)}
          >
            <Video className="mr-2 h-4 w-4" />
            {showRecordings ? 'Hide Recordings' : 'View Previous Recordings'}
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => navigate('/settings')}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-red-500 hover:text-red-600"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>

          {showRecordings && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Previous Recordings</h3>
              {recordings.length === 0 ? (
                <p className="text-muted-foreground">No recordings found.</p>
              ) : (
                <div className="space-y-4">
                  {recordings.map((recording, index) => (
                    <Card key={recording.id || index} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {format(recording.timestamp, 'PPpp')}
                          </p>
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
                            Download
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPage;