import React from 'react';
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';
import { Annotation } from '../AnnotationControls';

interface AnnotationListProps {
  annotations: Annotation[];
  selectedAnnotation: Annotation | null;
  onAnnotationClick: (annotation: Annotation) => void;
  onAnnotationRemove: (id: string) => void;
}

export const AnnotationList: React.FC<AnnotationListProps> = ({
  annotations,
  selectedAnnotation,
  onAnnotationClick,
  onAnnotationRemove,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {annotations.map((annotation) => (
        <div 
          key={annotation.id} 
          className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer ${
            selectedAnnotation?.id === annotation.id ? 'bg-primary/20' : 'bg-secondary/50'
          }`}
          onClick={() => onAnnotationClick(annotation)}
        >
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {formatTime(annotation.timestamp)}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onAnnotationRemove(annotation.id);
                }}
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
  );
};