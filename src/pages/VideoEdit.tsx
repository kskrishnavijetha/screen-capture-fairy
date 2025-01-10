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

  return (
    <div className="p-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/')} 
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <VideoEditor
        recordedBlob={recordedBlob}
        timestamps={[]}
        onSave={(newBlob) => {
          navigate('/playback', { state: { recordedBlob: newBlob } });
        }}
      />
    </div>
  );
};

export default VideoEdit;