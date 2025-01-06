import React from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from 'lucide-react';
import { cn } from "@/lib/utils";

interface VideoPlaybackProps {
  recordedBlob?: Blob;
}

const VideoPlayback = () => {
  const location = useLocation();
  const { recordedBlob } = location.state as VideoPlaybackProps;
  const [showSidebar, setShowSidebar] = React.useState(true);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Main content */}
      <div className={cn(
        "flex-1 p-6 transition-all duration-300",
        showSidebar ? "mr-[400px]" : "mr-0"
      )}>
        <div className="max-w-4xl mx-auto">
          <video
            src={recordedBlob ? URL.createObjectURL(recordedBlob) : ''}
            controls
            className="w-full rounded-lg bg-black mb-6"
          />
        </div>
      </div>

      {/* Right sidebar */}
      <div className={cn(
        "fixed right-0 top-0 h-full w-[400px] border-l border-border bg-card p-6 transition-transform duration-300",
        showSidebar ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Comments</h2>
          <Button variant="ghost" size="icon" onClick={() => setShowSidebar(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <textarea
                  placeholder="Leave a comment..."
                  className="w-full min-h-[100px] bg-background p-2 rounded-md border border-input resize-none"
                />
                <div className="mt-2 flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">😊</Button>
                    <Button variant="outline" size="sm">❤️</Button>
                    <Button variant="outline" size="sm">😂</Button>
                    <Button variant="outline" size="sm">😡</Button>
                  </div>
                  <Button size="sm">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Comment
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Example comments */}
          <Card className="p-4">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">User</span>
                  <span className="text-xs text-muted-foreground">2:30</span>
                </div>
                <p className="text-sm">Great video! Very helpful content.</p>
              </div>
            </div>
          </Card>
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