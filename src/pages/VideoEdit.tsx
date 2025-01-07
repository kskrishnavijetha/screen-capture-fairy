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
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">No video selected</h1>
        <Button onClick={() => navigate('/')}>Return to Home</Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <VideoEditor
        recordedBlob={recordedBlob}
        timestamps={[]}
        onSave={(newBlob) => {
          // Handle the saved blob
          navigate('/playback', { state: { recordedBlob: newBlob } });
        }}
      />
    </div>
  );
};

export default VideoEdit;