import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from 'lucide-react';

export interface Caption {
  startTime: number;
  endTime: number;
  text: string;
}

interface CaptionControlsProps {
  duration: number;
  captions: Caption[];
  onCaptionsChange: (captions: Caption[]) => void;
}

export const CaptionControls = ({ duration, captions, onCaptionsChange }: CaptionControlsProps) => {
  const [newCaption, setNewCaption] = useState<Partial<Caption>>({
    startTime: 0,
    endTime: 0,
    text: ''
  });

  const addCaption = () => {
    if (!newCaption.text || newCaption.startTime === undefined || newCaption.endTime === undefined) return;
    
    const caption: Caption = {
      startTime: newCaption.startTime,
      endTime: newCaption.endTime,
      text: newCaption.text
    };

    onCaptionsChange([...captions, caption]);
    setNewCaption({ startTime: 0, endTime: 0, text: '' });
  };

  const removeCaption = (index: number) => {
    const newCaptions = captions.filter((_, i) => i !== index);
    onCaptionsChange(newCaptions);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 mt-4">
      <h3 className="text-lg font-semibold">Captions</h3>
      
      <div className="space-y-4">
        {captions.map((caption, index) => (
          <div key={index} className="flex items-start gap-2 bg-secondary/50 p-2 rounded-lg">
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">
                {formatTime(caption.startTime)} - {formatTime(caption.endTime)}
              </div>
              <div className="mt-1">{caption.text}</div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeCaption(index)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-sm">Start Time (seconds)</label>
            <Input
              type="number"
              min={0}
              max={duration}
              value={newCaption.startTime}
              onChange={(e) => setNewCaption(prev => ({ ...prev, startTime: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className="text-sm">End Time (seconds)</label>
            <Input
              type="number"
              min={0}
              max={duration}
              value={newCaption.endTime}
              onChange={(e) => setNewCaption(prev => ({ ...prev, endTime: Number(e.target.value) }))}
            />
          </div>
        </div>
        <div>
          <label className="text-sm">Caption Text</label>
          <Textarea
            value={newCaption.text}
            onChange={(e) => setNewCaption(prev => ({ ...prev, text: e.target.value }))}
            placeholder="Enter caption text..."
            className="mt-1"
          />
        </div>
        <Button onClick={addCaption} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Caption
        </Button>
      </div>
    </div>
  );
};