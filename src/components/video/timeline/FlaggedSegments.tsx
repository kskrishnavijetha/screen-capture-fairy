import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flag, AlertTriangle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { formatTime } from '@/utils/timeUtils';

interface FlaggedSegment {
  id: string;
  video_id: string;
  start_time: number;
  end_time: number;
  flag_type: string;
  description: string | null;
}

interface FlaggedSegmentsProps {
  videoId: string;
  currentTime: number;
  onSeek: (time: number) => void;
}

export const FlaggedSegments = ({ videoId, currentTime, onSeek }: FlaggedSegmentsProps) => {
  const queryClient = useQueryClient();
  const [isSettingFlag, setIsSettingFlag] = React.useState(false);
  const [startTime, setStartTime] = React.useState<number | null>(null);

  const { data: flags, isLoading } = useQuery({
    queryKey: ['flagged-segments', videoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('timeline_flags')
        .select('*')
        .eq('video_id', videoId)
        .order('start_time');

      if (error) throw error;
      return data as FlaggedSegment[];
    },
  });

  const createFlagMutation = useMutation({
    mutationFn: async (flagData: { start_time: number; end_time: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('timeline_flags')
        .insert([{
          video_id: videoId,
          start_time: flagData.start_time,
          end_time: flagData.end_time,
          flag_type: 'problematic_segment',
          description: 'Potential issue detected',
          created_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flagged-segments'] });
      toast({
        title: "Segment flagged",
        description: "The problematic segment has been marked on the timeline",
      });
    },
  });

  const deleteFlagMutation = useMutation({
    mutationFn: async (flagId: string) => {
      const { error } = await supabase
        .from('timeline_flags')
        .delete()
        .eq('id', flagId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flagged-segments'] });
      toast({
        title: "Flag removed",
        description: "The flag has been removed from the timeline",
      });
    },
  });

  const handleFlagClick = () => {
    if (!isSettingFlag) {
      setIsSettingFlag(true);
      setStartTime(currentTime);
    } else if (startTime !== null) {
      createFlagMutation.mutate({
        start_time: startTime,
        end_time: currentTime
      });
      setIsSettingFlag(false);
      setStartTime(null);
    }
  };

  const handleCancelFlag = () => {
    setIsSettingFlag(false);
    setStartTime(null);
  };

  if (isLoading) return <div>Loading flags...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Flagged Segments
        </h3>
        <div className="flex gap-2">
          {isSettingFlag && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelFlag}
              className="gap-2"
            >
              Cancel
            </Button>
          )}
          <Button
            variant={isSettingFlag ? "destructive" : "secondary"}
            size="sm"
            onClick={handleFlagClick}
            className="gap-2"
          >
            <Flag className="h-4 w-4" />
            {isSettingFlag 
              ? `Set End Time (${formatTime(currentTime)})` 
              : `Flag at ${formatTime(currentTime)}`}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {flags?.map((flag) => (
          <div
            key={flag.id}
            className="flex items-center justify-between p-2 bg-yellow-500/10 rounded-lg hover:bg-yellow-500/20 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-yellow-500" />
              <div className="flex gap-2">
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-yellow-500/20"
                  onClick={() => onSeek(flag.start_time)}
                >
                  {formatTime(flag.start_time)}
                </Badge>
                <span>to</span>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-yellow-500/20"
                  onClick={() => onSeek(flag.end_time)}
                >
                  {formatTime(flag.end_time)}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteFlagMutation.mutate(flag.id)}
              className="hover:bg-yellow-500/20 hover:text-yellow-500"
            >
              <Flag className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {flags?.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-4">
            No segments flagged yet
          </div>
        )}
      </div>
    </div>
  );
};