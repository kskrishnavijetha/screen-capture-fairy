import React, { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { MediaPlayer } from '@/components/MediaPlayer';
import { Edit, Share, Download } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

const VideoPlayback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { recordedBlob } = location.state || {};
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);

  if (!recordedBlob) {
    navigate('/');
    return null;
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleEdit = () => {
    navigate('/edit', { state: { recordedBlob } });
  };

  const handleShare = () => {
    // Copy video URL to clipboard
    const videoUrl = window.location.href;
    navigator.clipboard.writeText(videoUrl).then(() => {
      toast({
        title: "Link copied",
        description: "Video link has been copied to clipboard"
      });
    }).catch(() => {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Could not copy the video link"
      });
    });
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
      </div>
    </div>
  );
};

export default VideoPlayback;