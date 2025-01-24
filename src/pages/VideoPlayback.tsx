import React, { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { VideoPreview } from '@/components/media/VideoPreview';
import { SharedTimeline } from '@/components/video/timeline/SharedTimeline';
import { MediaPlayer } from '@/components/MediaPlayer';
import { Edit, Share, Download } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

const VideoPlayback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { recordedBlob } = location.state || {};
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
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

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleAddTimestamp = () => {
    if (videoRef.current) {
      console.log('Adding timestamp at:', videoRef.current.currentTime);
    }
  };

  const handleStartTranscription = () => {
    setIsTranscribing(true);
    // Implementation for starting transcription
    console.log('Starting transcription');
  };

  const handleEdit = () => {
    navigate('/edit', { state: { recordedBlob } });
  };

  const handleShare = () => {
    navigate('/safeshare', { state: { recordedBlob } });
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
    <div className="container mx-auto p-4 space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-4">
          <MediaPlayer recordedBlob={recordedBlob} />
          
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleEdit} variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit Video
            </Button>
            <Button onClick={handleShare} variant="outline">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button onClick={handleDownload} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
        
        <div className="space-y-6">
          <SharedTimeline
            videoId={recordedBlob.size.toString()}
            videoRef={videoRef}
            currentTime={currentTime}
            onSeek={handleSeek}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoPlayback;