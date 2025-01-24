import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flag, X } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

interface Issue {
  id: string;
  video_id: string;
  timestamp: number;
  content: string;
  created_by: string;
}

interface IssueFlagsProps {
  videoId: string;
  currentTime: number;
  onSeek: (time: number) => void;
}

export const IssueFlags = ({ videoId, currentTime, onSeek }: IssueFlagsProps) => {
  const queryClient = useQueryClient();

  const { data: issues, isLoading } = useQuery({
    queryKey: ['timeline-issues', videoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('timeline_events')
        .select('*')
        .eq('video_id', videoId)
        .eq('event_type', 'issue')
        .order('timestamp');

      if (error) throw error;
      return data as Issue[];
    },
  });

  const flagIssueMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('timeline_events')
        .insert([{
          video_id: videoId,
          event_type: 'issue',
          timestamp: currentTime,
          content: 'Issue flagged',
          created_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline-issues'] });
      toast({
        title: "Issue flagged",
        description: "A new issue has been marked on the timeline",
      });
    },
  });

  const removeIssueMutation = useMutation({
    mutationFn: async (issueId: string) => {
      const { error } = await supabase
        .from('timeline_events')
        .delete()
        .eq('id', issueId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline-issues'] });
      toast({
        title: "Issue removed",
        description: "The issue has been removed from the timeline",
      });
    },
  });

  if (isLoading) return <div>Loading issues...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Issues</h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => flagIssueMutation.mutate()}
        >
          <Flag className="h-4 w-4 mr-2" />
          Flag Current Position
        </Button>
      </div>

      <div className="space-y-2">
        {issues?.map((issue) => (
          <div
            key={issue.id}
            className="flex items-center justify-between p-2 bg-red-500/10 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-red-500" />
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={() => onSeek(issue.timestamp)}
              >
                {new Date(issue.timestamp * 1000).toISOString().substr(11, 8)}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeIssueMutation.mutate(issue.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};