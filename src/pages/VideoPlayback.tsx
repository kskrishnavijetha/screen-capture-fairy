import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { VideoEditor } from '@/components/VideoEditor';
import { toast } from "@/hooks/use-toast";
import { format } from 'date-fns';

interface VideoPlaybackProps {
  recordedBlob?: Blob;
}

const VideoPlayback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentRecordingTime] = useState(new Date());
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    // Check for video data in URL parameters
    const params = new URLSearchParams(location.search);
    const videoData = params.get('video');
    
    if (videoData) {
      setVideoUrl(decodeURIComponent(videoData));
    } else if (location.state?.recordedBlob) {
      const blob = location.state.recordedBlob;
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    } else {
      navigate('/');
      return;
    }

    return () => {
      if (videoUrl && !videoUrl.startsWith('data:')) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [location, navigate]);

  const handleBack = () => {
    navigate('/');
  };

  if (!videoUrl) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Button
        variant="ghost"
        className="absolute top-4 left-4 p-2"
        onClick={handleBack}
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>

      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">
              {format(currentRecordingTime, 'PPpp')}
            </span>
          </div>
          
          <video
            src={videoUrl}
            controls
            className="w-full rounded-lg bg-black mb-6"
          />

          <div className="flex gap-4">
            <Button 
              onClick={() => navigate('/edit', { 
                state: { recordedBlob: location.state?.recordedBlob } 
              })}
              className="flex-1 items-center justify-center"
            >
              Edit Video
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayback;