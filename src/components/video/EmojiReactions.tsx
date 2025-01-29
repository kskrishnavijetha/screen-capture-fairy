import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Smile, Heart, Laugh, Angry, ThumbsUp, ThumbsDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

interface EmojiReaction {
  id: string;
  emoji: string;
  timestamp: number;
}

interface EmojiReactionsProps {
  videoId: string;
  currentTime: number;
  duration: number;
}

const EMOJIS = [
  { icon: Smile, label: 'smile' },
  { icon: Heart, label: 'heart' },
  { icon: Laugh, label: 'laugh' },
  { icon: Angry, label: 'angry' },
  { icon: ThumbsUp, label: 'thumbs-up' },
  { icon: ThumbsDown, label: 'thumbs-down' },
];

export const EmojiReactions: React.FC<EmojiReactionsProps> = ({
  videoId,
  currentTime,
  duration,
}) => {
  const [reactions, setReactions] = useState<EmojiReaction[]>([]);
  const [visibleReactions, setVisibleReactions] = useState<EmojiReaction[]>([]);

  useEffect(() => {
    const fetchReactions = async () => {
      const { data, error } = await supabase
        .from('video_reactions')
        .select('*')
        .eq('video_id', videoId);

      if (error) {
        console.error('Error fetching reactions:', error);
        return;
      }

      setReactions(data);
    };

    fetchReactions();

    // Subscribe to new reactions
    const channel = supabase
      .channel(`video-reactions-${videoId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'video_reactions',
        filter: `video_id=eq.${videoId}`,
      }, (payload) => {
        setReactions(prev => [...prev, payload.new as EmojiReaction]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [videoId]);

  useEffect(() => {
    // Show reactions within 2 seconds of their timestamp
    setVisibleReactions(
      reactions.filter(
        reaction => 
          Math.abs(reaction.timestamp - currentTime) < 2 &&
          reaction.timestamp <= currentTime
      )
    );
  }, [currentTime, reactions]);

  const handleEmojiClick = async (emoji: string) => {
    try {
      const { error } = await supabase
        .from('video_reactions')
        .insert({
          video_id: videoId,
          emoji,
          timestamp: currentTime,
        });

      if (error) throw error;

      toast({
        title: "Reaction added",
        description: "Your reaction has been added to the video",
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add reaction",
      });
    }
  };

  return (
    <>
      {/* Emoji reaction buttons */}
      <div className="absolute top-4 right-4 flex gap-2">
        {EMOJIS.map(({ icon: Icon, label }) => (
          <Button
            key={label}
            variant="outline"
            size="icon"
            className="bg-white/80 hover:bg-white"
            onClick={() => handleEmojiClick(label)}
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
      </div>

      {/* Display active reactions */}
      <div className="absolute inset-0 pointer-events-none">
        {visibleReactions.map((reaction) => {
          const Icon = EMOJIS.find(e => e.label === reaction.emoji)?.icon;
          if (!Icon) return null;

          return (
            <div
              key={reaction.id}
              className="absolute animate-fade-up"
              style={{
                left: `${Math.random() * 80 + 10}%`,
                top: `${Math.random() * 80 + 10}%`,
              }}
            >
              <Icon className="h-8 w-8 text-white drop-shadow-lg" />
            </div>
          );
        })}
      </div>
    </>
  );
};