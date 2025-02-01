import React from 'react';
import { Button } from '@/components/ui/button';
import { Paintbrush, Square, Circle, Pointer, Trash2, Save } from 'lucide-react';

interface DrawingToolbarProps {
  activeTool: 'select' | 'draw' | 'rectangle' | 'circle';
  activeColor: string;
  onToolChange: (tool: 'select' | 'draw' | 'rectangle' | 'circle') => void;
  onColorChange: (color: string) => void;
  onClear: () => void;
  onSave: () => void;
  isRecording: boolean;
}

export const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  activeTool,
  activeColor,
  onToolChange,
  onColorChange,
  onClear,
  onSave,
  isRecording,
}) => {
  const tools = [
    { id: 'select', icon: Pointer, label: 'Select' },
    { id: 'draw', icon: Paintbrush, label: 'Draw' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
  ] as const;

  const colors = [
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
  ];

  return (
    <div className="absolute top-4 left-4 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-lg border shadow-lg p-2 space-y-2">
      <div className="flex gap-1">
        {tools.map(({ id, icon: Icon, label }) => (
          <Button
            key={id}
            variant={activeTool === id ? "default" : "outline"}
            size="icon"
            onClick={() => onToolChange(id)}
            className="w-8 h-8"
            title={label}
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
      </div>
      
      <div className="flex gap-1">
        {colors.map((color) => (
          <button
            key={color}
            className={`w-8 h-8 rounded-full border-2 ${
              color === activeColor ? 'border-primary' : 'border-transparent'
            }`}
            style={{ backgroundColor: color }}
            onClick={() => onColorChange(color)}
          />
        ))}
      </div>

      <div className="flex gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={onClear}
          className="w-8 h-8"
          title="Clear canvas"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={onSave}
          className="w-8 h-8"
          title="Save annotations"
          disabled={!isRecording}
        >
          <Save className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};