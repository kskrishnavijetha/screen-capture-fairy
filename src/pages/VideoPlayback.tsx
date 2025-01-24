import React, { useRef, useState } from 'react';
import { VideoPreview } from '@/components/media/VideoPreview';
import { SharedTimeline } from '@/components/video/timeline/SharedTimeline';
import { useSearchParams } from 'react-router-dom';

const VideoPlayback = () => {
  const [searchParams] = useSearchParams();
  const videoId = searchParams.get('id') || '';
  const videoUrl = searchParams.get('url') || '';
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);

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
    // Implementation for adding timestamps
    console.log('Adding timestamp at:', currentTime);
  };

  const handleStartTranscription = () => {
    setIsTranscribing(true);
    // Implementation for starting transcription
    console.log('Starting transcription');
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <VideoPreview
            videoUrl={videoUrl}
            videoRef={videoRef}
            onAddTimestamp={handleAddTimestamp}
            onStartTranscription={handleStartTranscription}
            isTranscribing={isTranscribing}
          />
        </div>
        
        <div className="space-y-6">
          <SharedTimeline
            videoId={videoId}
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