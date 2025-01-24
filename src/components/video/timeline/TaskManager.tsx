import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { CheckCircle, Clock, AlertTriangle, Plus } from 'lucide-react';
import { Json } from '@/integrations/supabase/types';

type TaskStatus = 'todo' | 'in-progress' | 'done';

interface Task {
  id: string;
  video_id: string;
  timestamp: number;
  content: string;
  status: TaskStatus;
  created_by: string;
}

interface TimelineEvent {
  id: string;
  video_id: string;
  timestamp: number;
  content: string;
  created_by: string;
  event_type: string;
  metadata: Json;
  created_at: string;
}

interface TaskManagerProps {
  videoId: string;
  currentTime: number;
  onSeek: (time: number) => void;
}

export const TaskManager = ({ videoId, currentTime, onSeek }: TaskManagerProps) => {
  const [newTask, setNewTask] = React.useState('');
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
      
      // Map the timeline events to Task interface
      return (data as TimelineEvent[]).map(event => ({
        id: event.id,
        video_id: event.video_id,
        timestamp: event.timestamp,
        content: event.content || '',
        status: (event.metadata as { status?: TaskStatus })?.status || 'todo',
        created_by: event.created_by
      })) as Task[];
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (task: Omit<Task, 'id'>) => {
      const { data, error } = await supabase
        .from('timeline_events')
        .insert([{
          video_id: task.video_id,
          event_type: 'task',
          timestamp: task.timestamp,
          content: task.content,
          metadata: { status: task.status },
          created_by: task.created_by
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline-tasks'] });
      toast({
        title: "Task created",
        description: "New task has been added to the timeline",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      const { data, error } = await supabase
        .from('timeline_events')
        .update({ metadata: { status } })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline-tasks'] });
    },
  });

  const handleCreateTask = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await createTaskMutation.mutateAsync({
      video_id: videoId,
      timestamp: currentTime,
      content: newTask,
      status: 'todo',
      created_by: user.id,
    });

    setNewTask('');
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'todo':
        return 'bg-yellow-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'done':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'todo':
        return <Clock className="h-4 w-4" />;
      case 'in-progress':
        return <AlertTriangle className="h-4 w-4" />;
      case 'done':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (isLoading) return <div>Loading tasks...</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add new task..."
          className="flex-1"
        />
        <Button onClick={handleCreateTask} disabled={!newTask}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="space-y-2">
        {tasks?.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg"
          >
            <div className="flex items-center gap-2">
              {getStatusIcon(task.status)}
              <span>{task.content}</span>
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={() => onSeek(task.timestamp)}
              >
                {new Date(task.timestamp * 1000).toISOString().substr(11, 8)}
              </Badge>
            </div>
            <div className="flex gap-2">
              {task.status !== 'done' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateTaskMutation.mutate({
                    id: task.id,
                    status: task.status === 'todo' ? 'in-progress' : 'done'
                  })}
                >
                  {task.status === 'todo' ? 'Start' : 'Complete'}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};