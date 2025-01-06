import React, { useState, useRef } from 'react';
import { CommentSection } from './video/CommentSection';
import { TimestampSection } from './media/TimestampSection';
import { ScrollArea } from './ui/scroll-area';
import { Card } from './ui/card';

interface MediaPlayerProps {
  recordedBlob: Blob;
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({ recordedBlob }) => {
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleTimeClick = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  return (
    <div className="flex gap-4">
      <div className="flex-1 space-y-4">
        <video
          ref={videoRef}
          src={URL.createObjectURL(recordedBlob)}
          controls
          className="w-full rounded-lg bg-black"
          onEnded={() => URL.revokeObjectURL(URL.createObjectURL(recordedBlob))}
        />
        <CommentSection 
          videoId={recordedBlob.size.toString()} 
          onCommentSelect={(comment) => {
            setSelectedComment(comment);
            setShowSidebar(true);
          }}
          videoRef={videoRef}
        />
      </div>
      
      {showSidebar && (
        <Card className="w-80 p-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              <h3 className="font-semibold">Comments at this timestamp</h3>
              {selectedComment && (
                <div className="p-3 bg-accent rounded-lg">
                  <p>{selectedComment}</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
};