import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { VideoEditor } from '@/components/VideoEditor';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const VideoEdit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { recordedBlob } = location.state || {};

  if (!recordedBlob) {
    navigate('/');
    return null;
  }

  const handleBack = () => {
    navigate('/playback', { 
      state: { recordedBlob }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={handleBack}
                className="hover:bg-secondary/80"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Preview
              </Button>
              <h1 className="text-2xl font-semibold text-foreground">Edit Recording</h1>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-card rounded-lg shadow-lg p-6">
            <VideoEditor
              recordedBlob={recordedBlob}
              timestamps={[]}
              onSave={(newBlob) => {
                navigate('/playback', { 
                  state: { recordedBlob: newBlob } 
                });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoEdit;