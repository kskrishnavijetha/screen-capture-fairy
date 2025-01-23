import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Users } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface CollaborativeControlsProps {
  videoId: string;
  onPlaybackChange: (isPlaying: boolean) => void;
  onSeek: (time: number) => void;
  currentTime: number;
}

export const CollaborativeControls: React.FC<CollaborativeControlsProps> = ({
  videoId,
  onPlaybackChange,
  onSeek,
  currentTime
}) => {
  const [viewerCount, setViewerCount] = useState(0);
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    const videoChannel = supabase.channel(`video:${videoId}`, {
      config: {
        presence: {
          key: 'videoState',
        },
      },
    });

    videoChannel
      .on('presence', { event: 'sync' }, () => {
        const state = videoChannel.presenceState();
        setViewerCount(Object.keys(state).length);
      })
      .on('broadcast', { event: 'playback' }, ({ payload }) => {
        if (payload.type === 'play') {
          onPlaybackChange(true);
        } else if (payload.type === 'pause') {
          onPlaybackChange(false);
        } else if (payload.type === 'seek') {
          onSeek(payload.time);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await videoChannel.track({ watching: true, time: currentTime });
        }
      });

    setChannel(videoChannel);

    return () => {
      videoChannel.unsubscribe();
    };
  }, [videoId, onPlaybackChange, onSeek]);

  const broadcastPlaybackState = async (type: 'play' | 'pause' | 'seek', time?: number) => {
    if (!channel) return;

    try {
      await channel.send({
        type: 'broadcast',
        event: 'playback',
        payload: { type, time }
      });
    } catch (error) {
      console.error('Error broadcasting playback state:', error);
      toast({
        title: "Sync Error",
        description: "Failed to sync playback state with other viewers",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="flex items-center gap-1">
        <Users className="h-4 w-4" />
        {viewerCount} watching
      </Badge>
    </div>
  );
};