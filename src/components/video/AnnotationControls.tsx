import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Plus, X } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface Annotation {
  id: string;
  timestamp: number;
  text: string;
  author: string;
  video_id: string;
}

interface AnnotationControlsProps {
  duration: number;
  videoId: string;
}

export const AnnotationControls = ({ duration, videoId }: AnnotationControlsProps) => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [newAnnotation, setNewAnnotation] = useState<Partial<Annotation>>({
    timestamp: 0,
    text: '',
    author: ''
  });

  useEffect(() => {
    // Fetch existing annotations
    const fetchAnnotations = async () => {
      const { data, error } = await supabase
        .from('annotations')
        .select('*')
        .eq('video_id', videoId)
        .order('timestamp', { ascending: true });

      if (error) {
        toast({
          title: "Error fetching annotations",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setAnnotations(data || []);
    };

    fetchAnnotations();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('annotations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'annotations',
          filter: `video_id=eq.${videoId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAnnotations(prev => [...prev, payload.new as Annotation]);
          } else if (payload.eventType === 'DELETE') {
            setAnnotations(prev => prev.filter(a => a.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setAnnotations(prev => prev.map(a => 
              a.id === payload.new.id ? payload.new as Annotation : a
            ));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [videoId]);

  const addAnnotation = async () => {
    if (!newAnnotation.text) {
      toast({
        title: "Error",
        description: "Please enter annotation text",
        variant: "destructive",
      });
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      toast({
        title: "Authentication Error",
        description: "Please sign in to add annotations",
        variant: "destructive",
      });
      return;
    }

    const annotation = {
      video_id: videoId,
      timestamp: newAnnotation.timestamp || 0,
      text: newAnnotation.text,
      author: userData.user.id
    };

    const { error } = await supabase
      .from('annotations')
      .insert([annotation]);

    if (error) {
      toast({
        title: "Error adding annotation",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setNewAnnotation({ timestamp: 0, text: '', author: '' });
    
    toast({
      title: "Annotation added",
      description: "Your annotation has been added successfully",
    });
  };

  const removeAnnotation = async (id: string) => {
    const { error } = await supabase
      .from('annotations')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error removing annotation",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Annotation removed",
      description: "The annotation has been removed",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 mt-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        Annotations
      </h3>
      
      <div className="space-y-4">
        {annotations.map((annotation) => (
          <div key={annotation.id} className="flex items-start gap-2 bg-secondary/50 p-2 rounded-lg">
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {formatTime(annotation.timestamp)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAnnotation(annotation.id)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-1">{annotation.text}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div>
          <label className="text-sm">Timestamp (seconds)</label>
          <Input
            type="number"
            min={0}
            max={duration}
            value={newAnnotation.timestamp}
            onChange={(e) => setNewAnnotation(prev => ({ ...prev, timestamp: Number(e.target.value) }))}
          />
        </div>
        <div>
          <label className="text-sm">Comment</label>
          <Textarea
            value={newAnnotation.text}
            onChange={(e) => setNewAnnotation(prev => ({ ...prev, text: e.target.value }))}
            placeholder="Add your comment..."
            className="mt-1"
          />
        </div>
        <Button onClick={addAnnotation} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Annotation
        </Button>
      </div>
    </div>
  );
};