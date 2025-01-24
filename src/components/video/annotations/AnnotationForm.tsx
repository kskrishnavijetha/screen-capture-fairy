import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from 'lucide-react';

interface AnnotationFormProps {
  currentTime: number;
  text: string;
  timestamp: number;
  onTextChange: (text: string) => void;
  onTimestampChange: (timestamp: number) => void;
  onSubmit: () => void;
}

export const AnnotationForm: React.FC<AnnotationFormProps> = ({
  currentTime,
  text,
  timestamp,
  onTextChange,
  onTimestampChange,
  onSubmit,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm">Current Time: {formatTime(currentTime)}</label>
        <Input
          type="number"
          min={0}
          value={timestamp}
          onChange={(e) => onTimestampChange(Number(e.target.value))}
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-sm">Comment</label>
        <Textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Add your comment..."
          className="mt-1"
        />
      </div>
      <Button onClick={onSubmit} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Annotation
      </Button>
    </div>
  );
};