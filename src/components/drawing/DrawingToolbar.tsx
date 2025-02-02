import React from 'react';
import { Button } from "@/components/ui/button";
import { Pen, Highlighter, Square, Circle, ArrowRight, Eraser } from 'lucide-react';
import { ColorPicker } from './ColorPicker';

export type DrawingTool = 'pen' | 'highlighter' | 'square' | 'circle' | 'arrow' | 'eraser';

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
    { id: 'pen' as DrawingTool, icon: Pen },
    { id: 'highlighter' as DrawingTool, icon: Highlighter },
    { id: 'square' as DrawingTool, icon: Square },
    { id: 'circle' as DrawingTool, icon: Circle },
    { id: 'arrow' as DrawingTool, icon: ArrowRight },
    { id: 'eraser' as DrawingTool, icon: Eraser },
  ];

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 rounded-lg border shadow-lg space-y-2">
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
      <div className="pt-2 border-t">
        <ColorPicker color={activeColor} onChange={onColorChange} />
      </div>
    </div>
  );
};