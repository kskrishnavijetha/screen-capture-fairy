import React from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Pen, Highlighter, Square, Circle, ArrowRight, Eraser } from 'lucide-react';
import { ColorPicker } from './ColorPicker';

export type DrawingTool = 'pen' | 'highlighter' | 'rectangle' | 'circle' | 'arrow' | 'eraser';

interface DrawingToolbarProps {
  activeTool: DrawingTool;
  activeColor: string;
  onToolChange: (tool: DrawingTool) => void;
  onColorChange: (color: string) => void;
}

export const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  activeTool,
  activeColor,
  onToolChange,
  onColorChange,
}) => {
  const tools = [
    { id: 'pen' as DrawingTool, icon: Pen, label: 'Pen' },
    { id: 'highlighter' as DrawingTool, icon: Highlighter, label: 'Highlighter' },
    { id: 'rectangle' as DrawingTool, icon: Square, label: 'Rectangle' },
    { id: 'circle' as DrawingTool, icon: Circle, label: 'Circle' },
    { id: 'arrow' as DrawingTool, icon: ArrowRight, label: 'Arrow' },
    { id: 'eraser' as DrawingTool, icon: Eraser, label: 'Eraser' },
  ];

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-lg border shadow-lg p-2 space-y-2">
      {tools.map((tool) => (
        <Button
          key={tool.id}
          variant={activeTool === tool.id ? "default" : "ghost"}
          size="icon"
          onClick={() => onToolChange(tool.id)}
          className="w-10 h-10"
        >
          <tool.icon className="h-5 w-5" />
        </Button>
      ))}
      <Separator className="my-2" />
      <ColorPicker
        color={activeColor}
        onChange={onColorChange}
      />
    </div>
  );
};