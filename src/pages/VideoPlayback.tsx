import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MessageCircle, X, Scissors } from 'lucide-react';
import { cn } from "@/lib/utils";
import { VideoEditor } from '@/components/VideoEditor';

interface VideoPlaybackProps {
  recordedBlob?: Blob;
}

const VideoPlayback = () => {
  const location = useLocation();
  const { recordedBlob } = location.state as VideoPlaybackProps;
  const [showSidebar, setShowSidebar] = useState(true);
  const [removeSilences, setRemoveSilences] = useState(false);
  const [removeFillerWords, setRemoveFillerWords] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);

  const handleSaveEdit = (newBlob: Blob) => {
    setProcessedBlob(newBlob);
    setIsEditing(false);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Main content */}
      <div className={cn(
        "flex-1 p-6 transition-all duration-300",
        showSidebar ? "mr-[400px]" : "mr-0"
      )}>
        <div className="max-w-4xl mx-auto">
          {isEditing ? (
            <VideoEditor 
              recordedBlob={recordedBlob || null}
              timestamps={[]}
              onSave={handleSaveEdit}
            />
          ) : (
            <video
              src={processedBlob ? URL.createObjectURL(processedBlob) : (recordedBlob ? URL.createObjectURL(recordedBlob) : '')}
              controls
              className="w-full rounded-lg bg-black mb-6"
            />
          )}
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
            <h2 className="text-lg font-semibold">Edits</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowSidebar(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Editing Controls */}
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {/* Edit and trim video button */}
            <Button 
              variant="outline" 
              className="w-full justify-between group hover:border-primary"
              onClick={() => setIsEditing(true)}
            >
              <div className="flex items-center gap-2">
                <Scissors className="h-4 w-4" />
                <span>Edit and trim video</span>
              </div>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                →
              </span>
            </Button>

            {/* Remove silences toggle */}
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

            {/* Remove filler words toggle */}
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

          {/* Comments Section */}
          <div className="border-t">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Comments</h3>
              <Card className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <textarea
                      placeholder="Leave a comment..."
                      className="w-full min-h-[100px] bg-background p-2 rounded-md border border-input resize-none"
                    />
                    <div className="mt-2 flex justify-end">
                      <Button size="sm">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
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
          Comments
        </Button>
      )}
    </div>
  );
};

export default VideoPlayback;