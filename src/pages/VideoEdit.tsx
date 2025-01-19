import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { VideoEditor } from '@/components/VideoEditor';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ShareControls } from '@/components/video/ShareControls';
import { EmbedControls } from '@/components/video/EmbedControls';
import { Card } from '@/components/ui/card';

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
    <div className="container mx-auto p-6 space-y-6">
      <Button 
        variant="ghost" 
        onClick={handleBack}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Preview
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
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

        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Share Video</h3>
            <ShareControls recordedBlob={recordedBlob} />
          </Card>

          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Embed Video</h3>
            <EmbedControls recordedBlob={recordedBlob} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VideoEdit;