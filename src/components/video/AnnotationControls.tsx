import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AnnotationOverlay } from './annotations/AnnotationOverlay';
import { AnnotationForm } from './annotations/AnnotationForm';
import { AnnotationList } from './annotations/AnnotationList';

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
  currentTime: number;
  onAnnotationClick?: (timestamp: number) => void;
}

export const AnnotationControls = ({ 
  duration, 
  videoId, 
  currentTime,
  onAnnotationClick 
}: AnnotationControlsProps) => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [newAnnotation, setNewAnnotation] = useState<Partial<Annotation>>({
    timestamp: currentTime,
    text: '',
    author: ''
  });
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);

  useEffect(() => {
    setNewAnnotation(prev => ({
      ...prev,
      timestamp: currentTime
    }));
  }, [currentTime]);

  useEffect(() => {
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

    setNewAnnotation({ timestamp: currentTime, text: '', author: '' });
    
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

  const handleAnnotationClick = (annotation: Annotation) => {
    setSelectedAnnotation(annotation);
    if (onAnnotationClick) {
      onAnnotationClick(annotation.timestamp);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        Annotations
      </h3>
      
      <AnnotationOverlay
        annotations={annotations}
        duration={duration}
        selectedAnnotation={selectedAnnotation}
        onAnnotationClick={handleAnnotationClick}
      />

      <AnnotationList
        annotations={annotations}
        selectedAnnotation={selectedAnnotation}
        onAnnotationClick={handleAnnotationClick}
        onAnnotationRemove={removeAnnotation}
      />

      <AnnotationForm
        currentTime={currentTime}
        text={newAnnotation.text || ''}
        timestamp={newAnnotation.timestamp || 0}
        onTextChange={(text) => setNewAnnotation(prev => ({ ...prev, text }))}
        onTimestampChange={(timestamp) => setNewAnnotation(prev => ({ ...prev, timestamp }))}
        onSubmit={addAnnotation}
      />
    </div>
  );
};