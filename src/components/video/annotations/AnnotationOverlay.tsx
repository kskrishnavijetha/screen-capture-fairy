import React from 'react';
import { Annotation } from '../AnnotationControls';

interface AnnotationOverlayProps {
  annotations: Annotation[];
  duration: number;
  selectedAnnotation: Annotation | null;
  onAnnotationClick: (annotation: Annotation) => void;
}

export const AnnotationOverlay: React.FC<AnnotationOverlayProps> = ({
  annotations,
  duration,
  selectedAnnotation,
  onAnnotationClick,
}) => {
  return (
    <div className="relative">
      {annotations.map((annotation) => (
        <div
          key={annotation.id}
          className={`absolute cursor-pointer transform -translate-y-1/2 ${
            selectedAnnotation?.id === annotation.id ? 'bg-primary' : 'bg-secondary'
          } text-white px-2 py-1 rounded-full text-sm`}
          style={{
            left: `${(annotation.timestamp / duration) * 100}%`,
            top: '50%',
            zIndex: 10
          }}
          onClick={() => onAnnotationClick(annotation)}
        >
          {annotation.text}
        </div>
      ))}
    </div>
  );
};