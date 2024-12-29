import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Circle, IText, Path } from 'fabric';
import { Button } from "@/components/ui/button";
import { Pencil, Type, Highlighter, Eraser } from 'lucide-react';

interface AnnotationToolsProps {
  isRecording: boolean;
}

export const AnnotationTools = ({ isRecording }: AnnotationToolsProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<'draw' | 'text' | 'highlight' | 'eraser' | null>(null);

  useEffect(() => {
    if (!canvasRef.current || fabricCanvas) return;

    // Create canvas with full screen dimensions
    const canvas = new FabricCanvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      isDrawingMode: false,
    });

    // Make canvas background transparent
    canvas.backgroundColor = 'rgba(0,0,0,0)';
    
    setFabricCanvas(canvas);

    // Cleanup
    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas) return;

    // Update canvas size on window resize
    const handleResize = () => {
      fabricCanvas.setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fabricCanvas]);

  const handleToolClick = (tool: typeof activeTool) => {
    if (!fabricCanvas) return;

    setActiveTool(tool);
    fabricCanvas.isDrawingMode = tool === 'draw' || tool === 'highlight';

    if (tool === 'draw') {
      fabricCanvas.freeDrawingBrush.width = 2;
      fabricCanvas.freeDrawingBrush.color = '#ff0000';
    } else if (tool === 'highlight') {
      fabricCanvas.freeDrawingBrush.width = 20;
      fabricCanvas.freeDrawingBrush.color = 'rgba(255, 255, 0, 0.4)';
    } else if (tool === 'text') {
      const text = new IText('Click to edit', {
        left: 100,
        top: 100,
        fontSize: 20,
        fill: '#ff0000',
      });
      fabricCanvas.add(text);
    } else if (tool === 'eraser') {
      fabricCanvas.freeDrawingBrush.width = 20;
      fabricCanvas.freeDrawingBrush.color = 'rgba(0,0,0,0)';
    }
  };

  if (!isRecording) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-black/80 rounded-lg p-2 flex gap-2">
      <Button
        variant={activeTool === 'draw' ? 'default' : 'secondary'}
        size="icon"
        onClick={() => handleToolClick('draw')}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant={activeTool === 'highlight' ? 'default' : 'secondary'}
        size="icon"
        onClick={() => handleToolClick('highlight')}
      >
        <Highlighter className="h-4 w-4" />
      </Button>
      <Button
        variant={activeTool === 'text' ? 'default' : 'secondary'}
        size="icon"
        onClick={() => handleToolClick('text')}
      >
        <Type className="h-4 w-4" />
      </Button>
      <Button
        variant={activeTool === 'eraser' ? 'default' : 'secondary'}
        size="icon"
        onClick={() => handleToolClick('eraser')}
      >
        <Eraser className="h-4 w-4" />
      </Button>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-auto"
        style={{ zIndex: 1000 }}
      />
    </div>
  );
};