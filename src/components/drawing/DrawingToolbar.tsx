import React from 'react';
import { Button } from '@/components/ui/button';
import { Paintbrush, Square, Circle, Pointer, Trash2, Save, Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
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
    { id: 'select' as const, icon: Pointer, label: 'Select' },
    { id: 'draw' as const, icon: Paintbrush, label: 'Draw' },
    { id: 'rectangle' as const, icon: Square, label: 'Rectangle' },
    { id: 'circle' as const, icon: Circle, label: 'Circle' },
  ];

  const colors = [
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="default" size="icon" className="rounded-full shadow-lg">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto rounded-t-xl">
          <div className="space-y-4 p-2">
            <div className="flex gap-2 justify-center">
              {tools.map(({ id, icon: Icon, label }) => (
                <Button
                  key={id}
                  variant={activeTool === id ? "default" : "outline"}
                  size="icon"
                  onClick={() => onToolChange(id)}
                  className="w-10 h-10"
                  title={label}
                >
                  <Icon className="h-5 w-5" />
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2 justify-center">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${
                    color === activeColor ? 'border-primary shadow-lg scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => onColorChange(color)}
                />
              ))}
            </div>

            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={onClear}
                className="w-10 h-10"
                title="Clear canvas"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={onSave}
                className="w-10 h-10"
                title="Save annotations"
                disabled={!isRecording}
              >
                <Save className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};