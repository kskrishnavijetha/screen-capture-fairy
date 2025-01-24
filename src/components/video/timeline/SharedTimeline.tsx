import React, { useEffect, useState } from 'react';
import { WaveformView } from '../WaveformView';
import { TimelineView } from './TimelineView';
import { Card } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

interface SharedTimelineProps {
  videoId: string;
  videoRef: React.RefObject<HTMLVideoElement>;
  currentTime: number;
  onSeek: (time: number) => void;
}

export const SharedTimeline = ({ 
  videoId, 
  videoRef, 
  currentTime, 
  onSeek 
}: SharedTimelineProps) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Subscribe to real-time updates
    const channel = supabase.channel(`timeline:${videoId}`)
      .on('presence', { event: 'sync' }, () => {
        setIsConnected(true);
        toast({
          title: "Connected to timeline",
          description: "You can now collaborate with others in real-time",
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [videoId]);

  return (
    <Card className="p-4 space-y-6">
      <div className="space-y-4">
        {videoRef.current && (
          <WaveformView 
            videoRef={videoRef} 
            onTimeUpdate={onSeek}
          />
        )}
        
        <TimelineView 
          videoId={videoId} 
          currentTime={currentTime} 
          onSeek={onSeek}
        />
      </div>
    </Card>
  );
};