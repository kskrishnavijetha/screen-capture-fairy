import React from 'react';
import { Button } from '@/components/ui/button';
import { Paintbrush, Square, Circle, Pointer, Trash2, Save, Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="fixed left-4 top-1/4 z-20"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px]">
        <SheetHeader>
          <SheetTitle>Drawing Toolbar</SheetTitle>
        </SheetHeader>
        
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Tools</div>
            <div className="grid grid-cols-2 gap-2">
              {tools.map(({ id, icon: Icon, label }) => (
                <Button
                  key={id}
                  variant={activeTool === id ? "default" : "outline"}
                  onClick={() => onToolChange(id)}
                  className="w-full justify-start"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Colors</div>
            <div className="grid grid-cols-3 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`h-8 rounded-md border-2 transition-all ${
                    color === activeColor ? 'border-primary scale-110' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => onColorChange(color)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Actions</div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClear}
                className="flex-1"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear
              </Button>
              <Button
                variant="outline"
                onClick={onSave}
                disabled={!isRecording}
                className="flex-1"
              >
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};