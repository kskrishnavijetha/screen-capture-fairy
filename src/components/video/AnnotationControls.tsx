import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Plus, X } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

export interface Annotation {
  id: string;
  timestamp: number;
  text: string;
  author: string;
}

interface AnnotationControlsProps {
  duration: number;
  annotations: Annotation[];
  onAnnotationsChange: (annotations: Annotation[]) => void;
}

export const AnnotationControls = ({ duration, annotations, onAnnotationsChange }: AnnotationControlsProps) => {
  const [newAnnotation, setNewAnnotation] = useState<Partial<Annotation>>({
    timestamp: 0,
    text: '',
    author: 'User'
  });

  const addAnnotation = () => {
    if (!newAnnotation.text) {
      toast({
        title: "Error",
        description: "Please enter annotation text",
        variant: "destructive",
      });
      return;
    }
    
    const annotation: Annotation = {
      id: Date.now().toString(),
      timestamp: newAnnotation.timestamp || 0,
      text: newAnnotation.text,
      author: newAnnotation.author || 'User'
    };

    onAnnotationsChange([...annotations, annotation]);
    setNewAnnotation({ timestamp: 0, text: '', author: 'User' });
    
    toast({
      title: "Annotation added",
      description: "Your annotation has been added successfully",
    });
  };

  const removeAnnotation = (id: string) => {
    const newAnnotations = annotations.filter(a => a.id !== id);
    onAnnotationsChange(newAnnotations);
    
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
                  {formatTime(annotation.timestamp)} - {annotation.author}
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
        <div className="grid grid-cols-2 gap-2">
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
            <label className="text-sm">Author</label>
            <Input
              type="text"
              value={newAnnotation.author}
              onChange={(e) => setNewAnnotation(prev => ({ ...prev, author: e.target.value }))}
              placeholder="Enter your name"
            />
          </div>
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