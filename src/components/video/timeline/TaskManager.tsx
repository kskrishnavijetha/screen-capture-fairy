import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Clock } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface Task {
  id: string;
  video_id: string;
  timestamp: number;
  content: string;
  status: 'todo' | 'done';
  created_by: string;
  assignee_id?: string;
}

interface TaskManagerProps {
  videoId: string;
  currentTime: number;
  onSeek: (time: number) => void;
}

export const TaskManager = ({ videoId, currentTime, onSeek }: TaskManagerProps) => {
  const [newTaskContent, setNewTaskContent] = React.useState('');
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['timeline-tasks', videoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('timeline_events')
        .select('*')
        .eq('video_id', videoId)
        .eq('event_type', 'task')
        .order('timestamp');

      if (error) throw error;
      return data as Task[];
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data, error } = await supabase
        .from('timeline_events')
        .insert([{
          video_id: videoId,
          event_type: 'task',
          timestamp: currentTime,
          content,
          status: 'todo'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline-tasks'] });
      setNewTaskContent('');
      toast({
        title: "Task created",
        description: "A new task has been added to the timeline",
      });
    },
  });

  const toggleTaskStatusMutation = useMutation({
    mutationFn: async ({ taskId, newStatus }: { taskId: string; newStatus: 'todo' | 'done' }) => {
      const { error } = await supabase
        .from('timeline_events')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline-tasks'] });
    },
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskContent.trim()) {
      createTaskMutation.mutate(newTaskContent.trim());
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Tasks
        </h3>
      </div>

      <form onSubmit={handleCreateTask} className="flex gap-2">
        <Input
          value={newTaskContent}
          onChange={(e) => setNewTaskContent(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1"
        />
        <Button type="submit" disabled={!newTaskContent.trim()}>
          Add Task
        </Button>
      </form>

      <div className="space-y-2">
        {isLoading ? (
          <div>Loading tasks...</div>
        ) : tasks?.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-4">
            No tasks created yet
          </div>
        ) : (
          tasks?.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-2 bg-accent/10 rounded-lg hover:bg-accent/20 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto hover:bg-transparent"
                  onClick={() => toggleTaskStatusMutation.mutate({
                    taskId: task.id,
                    newStatus: task.status === 'todo' ? 'done' : 'todo'
                  })}
                >
                  {task.status === 'done' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </Button>
                <span className={task.status === 'done' ? 'line-through text-muted-foreground' : ''}>
                  {task.content}
                </span>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-accent/20"
                  onClick={() => onSeek(task.timestamp)}
                >
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(task.timestamp * 1000).toISOString().substr(11, 8)}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};