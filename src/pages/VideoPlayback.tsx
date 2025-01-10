import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MessageCircle, X, ArrowLeft, Scissors } from 'lucide-react';
import { cn } from "@/lib/utils";
import { VideoEditor } from '@/components/VideoEditor';

interface VideoPlaybackProps {
  recordedBlob?: Blob;
}

const VideoPlayback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { recordedBlob } = location.state as VideoPlaybackProps;
  const [showSidebar, setShowSidebar] = useState(true);
  const [removeSilences, setRemoveSilences] = useState(false);
  const [removeFillerWords, setRemoveFillerWords] = useState(false);

  const handleEditClick = () => {
    navigate('/edit', { state: { recordedBlob } });
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Back button */}
      <Button
        variant="ghost"
        className="absolute top-4 left-4 p-2"
        onClick={handleBack}
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>

      {/* Main content */}
      <div className={cn(
        "flex-1 p-6 transition-all duration-300",
        showSidebar ? "mr-[400px]" : "mr-0"
      )}>
        <div className="max-w-4xl mx-auto space-y-4">
          <video
            src={recordedBlob ? URL.createObjectURL(recordedBlob) : ''}
            controls
            className="w-full rounded-lg bg-black mb-6"
          />
          <Button 
            onClick={handleEditClick}
            className="w-full flex items-center justify-center gap-2"
          >
            <Scissors className="h-4 w-4" />
            Edit Video
          </Button>
        </div>
      </div>

      {/* Right sidebar */}
      <div className={cn(
        "fixed right-0 top-0 h-full w-[400px] border-l border-border bg-card transition-transform duration-300",
        showSidebar ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold">Options</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowSidebar(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Options */}
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between space-x-4">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Remove silences</div>
                <div className="text-xs text-muted-foreground">
                  Automatically remove silent parts of the video
                </div>
              </div>
              <Switch
                checked={removeSilences}
                onCheckedChange={setRemoveSilences}
              />
            </div>

            <div className="flex items-center justify-between space-x-4">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Remove filler words</div>
                <div className="text-xs text-muted-foreground">
                  Remove common filler words from the video
                </div>
              </div>
              <Switch
                checked={removeFillerWords}
                onCheckedChange={setRemoveFillerWords}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Toggle sidebar button when closed */}
      {!showSidebar && (
        <Button
          className="fixed right-6 top-6"
          onClick={() => setShowSidebar(true)}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Options
        </Button>
      )}
    </div>
  );
};

export default VideoPlayback;