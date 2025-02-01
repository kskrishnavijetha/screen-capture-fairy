import React from 'react';
import { Button } from "@/components/ui/button";
import { Pencil, MousePointer, Trash } from 'lucide-react';
import { Slider } from "@/components/ui/slider";

interface DrawingToolbarProps {
  activeTool: 'draw' | 'select';
  activeColor: string;
  brushSize: number;
  onToolChange: (tool: 'draw' | 'select') => void;
  onColorChange: (color: string) => void;
  onBrushSizeChange: (size: number) => void;
  onClearCanvas: () => void;
}

export const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  activeTool,
  activeColor,
  brushSize,
  onToolChange,
  onColorChange,
  onBrushSizeChange,
  onClearCanvas,
}) => {
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#000000'];

  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm border rounded-lg p-4 shadow-lg z-20">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Button
            size="icon"
            variant={activeTool === 'draw' ? 'default' : 'outline'}
            onClick={() => onToolChange('draw')}
            className="w-10 h-10"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={activeTool === 'select' ? 'default' : 'outline'}
            onClick={() => onToolChange('select')}
            className="w-10 h-10"
          >
            <MousePointer className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={onClearCanvas}
            className="w-10 h-10"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
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

        <div className="w-full px-2">
          <Slider
            value={[brushSize]}
            onValueChange={(value) => onBrushSizeChange(value[0])}
            min={1}
            max={20}
            step={1}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};