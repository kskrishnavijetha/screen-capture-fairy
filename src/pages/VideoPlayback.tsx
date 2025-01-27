import React, { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { VideoPreview } from '@/components/media/VideoPreview';
import { MediaPlayer } from '@/components/MediaPlayer';
import { Edit, Download } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

const VideoPlayback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { recordedBlob } = location.state || {};
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  if (!recordedBlob) {
    navigate('/');
    return null;
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleAddTimestamp = () => {
    if (videoRef.current) {
      console.log('Adding timestamp at:', videoRef.current.currentTime);
    }
  };

  const handleStartTranscription = () => {
    setIsTranscribing(true);
    console.log('Starting transcription');
  };

  const handleEdit = () => {
    navigate('/edit', { state: { recordedBlob } });
  };

  const handleDownload = () => {
    try {
      const url = URL.createObjectURL(recordedBlob);
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
    } catch (error) {
      console.error('Download error:', error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "There was an error downloading your recording"
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <MediaPlayer recordedBlob={recordedBlob} />
        
        <div className="flex flex-wrap gap-2 justify-center">
          <Button onClick={handleEdit} variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit Video
          </Button>
          <Button onClick={handleDownload} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayback;