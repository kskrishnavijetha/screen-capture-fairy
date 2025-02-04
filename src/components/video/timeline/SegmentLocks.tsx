import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Lock, LockOpen } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { formatTime } from '@/utils/timeUtils';

interface SegmentLock {
  id: string;
  video_id: string;
  start_time: number;
  end_time: number;
  locked_by: string;
  created_at: string;
}

interface SegmentLocksProps {
  videoId: string;
  currentTime: number;
  onSeek: (time: number) => void;
}

export const SegmentLocks = ({ videoId, currentTime, onSeek }: SegmentLocksProps) => {
  const [isLocking, setIsLocking] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: locks, isLoading } = useQuery({
    queryKey: ['segment-locks', videoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('timeline_segment_locks')
        .select('*')
        .eq('video_id', videoId)
        .order('start_time');

      if (error) throw error;
      return data as SegmentLock[];
    },
  });

  const createLockMutation = useMutation({
    mutationFn: async (lockData: { start_time: number; end_time: number }) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('timeline_segment_locks')
        .insert([{
          video_id: videoId,
          start_time: lockData.start_time,
          end_time: lockData.end_time,
          locked_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['segment-locks'] });
      toast({
        title: "Segment locked",
        description: "The timeline segment has been locked for editing",
      });
    },
  });

  const deleteLockMutation = useMutation({
    mutationFn: async (lockId: string) => {
      const { error } = await supabase
        .from('timeline_segment_locks')
        .delete()
        .eq('id', lockId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['segment-locks'] });
      toast({
        title: "Segment unlocked",
        description: "The timeline segment has been unlocked",
      });
    },
  });

  const handleTimeClick = () => {
    if (!isLocking) {
      setIsLocking(true);
      setStartTime(currentTime);
      toast({
        title: "Start time set",
        description: `Lock starting at ${formatTime(currentTime)}`,
      });
    } else if (startTime !== null && currentTime > startTime) {
      createLockMutation.mutate({
        start_time: startTime,
        end_time: currentTime,
      });
      setIsLocking(false);
      setStartTime(null);
    }
  };

  const handleCancelLock = () => {
    setIsLocking(false);
    setStartTime(null);
    toast({
      title: "Lock cancelled",
      description: "Segment locking cancelled",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Segment Locks
        </h3>
        <div className="flex gap-2">
          <Button
            variant={isLocking ? "destructive" : "default"}
            size="sm"
            onClick={handleTimeClick}
            className="gap-2"
          >
            {isLocking ? (
              <>
                <LockOpen className="h-4 w-4" />
                End Lock at {formatTime(currentTime)}
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Lock at {formatTime(currentTime)}
              </>
            )}
          </Button>
          {isLocking && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelLock}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <div>Loading locks...</div>
        ) : locks?.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-4">
            No segments are currently locked
          </div>
        ) : (
          locks?.map((lock) => (
            <div
              key={lock.id}
              className="flex items-center justify-between p-2 bg-accent/10 rounded-lg hover:bg-accent/20 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-accent/20"
                  onClick={() => onSeek(lock.start_time)}
                >
                  {formatTime(lock.start_time)}
                </Button>
                <span>to</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-accent/20"
                  onClick={() => onSeek(lock.end_time)}
                >
                  {formatTime(lock.end_time)}
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteLockMutation.mutate(lock.id)}
                className="hover:bg-destructive/20 hover:text-destructive"
              >
                <LockOpen className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};