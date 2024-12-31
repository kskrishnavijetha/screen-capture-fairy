import React from 'react';
import { Button } from "@/components/ui/button";
import { Pencil, Type, Highlighter, Eraser, Undo, GripHorizontal } from 'lucide-react';

interface DraggableToolbarProps {
  position: { x: number; y: number };
  activeTool: 'draw' | 'text' | 'highlight' | 'eraser' | null;
  onToolClick: (tool: 'draw' | 'text' | 'highlight' | 'eraser' | null) => void;
  onUndo: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  canUndo: boolean;
}

export const DraggableToolbar: React.FC<DraggableToolbarProps> = ({
  position,
  activeTool,
  onToolClick,
  onUndo,
  onMouseDown,
  canUndo
}) => {
  return (
    <div
      className="fixed flex gap-3 bg-black/90 rounded-lg p-3"
      style={{
        left: position.x,
        top: position.y,
        zIndex: 1001,
      }}
      onMouseDown={onMouseDown}
    >
      <div className="drag-handle flex items-center mr-2 cursor-grab active:cursor-grabbing">
        <GripHorizontal className="h-5 w-5 text-gray-400" />
      </div>
      <Button
        variant={activeTool === 'draw' ? 'default' : 'secondary'}
        size="icon"
        onClick={() => onToolClick('draw')}
        className="hover:bg-primary/90"
      >
        <Pencil className="h-5 w-5" />
      </Button>
      <Button
        variant={activeTool === 'highlight' ? 'default' : 'secondary'}
        size="icon"
        onClick={() => onToolClick('highlight')}
        className="hover:bg-primary/90"
      >
        <Highlighter className="h-5 w-5" />
      </Button>
      <Button
        variant={activeTool === 'text' ? 'default' : 'secondary'}
        size="icon"
        onClick={() => onToolClick('text')}
        className="hover:bg-primary/90"
      >
        <Type className="h-5 w-5" />
      </Button>
      <Button
        variant={activeTool === 'eraser' ? 'default' : 'secondary'}
        size="icon"
        onClick={() => onToolClick('eraser')}
        className="hover:bg-primary/90"
      >
        <Eraser className="h-5 w-5" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        onClick={onUndo}
        disabled={!canUndo}
        className="hover:bg-primary/90"
      >
        <Undo className="h-5 w-5" />
      </Button>
    </div>
  );
};