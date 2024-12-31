import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Circle, IText } from 'fabric';
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

    const canvas = new FabricCanvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      isDrawingMode: false,
      selection: true,
      renderOnAddRemove: true,
    });

    canvas.backgroundColor = 'rgba(0,0,0,0)';
    canvas.preserveObjectStacking = true;
    
    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas) return;

    const handleResize = () => {
      fabricCanvas.setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      fabricCanvas.renderAll();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fabricCanvas]);

  const handleToolClick = (tool: typeof activeTool) => {
    if (!fabricCanvas) return;

    setActiveTool(tool);
    fabricCanvas.isDrawingMode = tool === 'draw' || tool === 'highlight' || tool === 'eraser';

    if (tool === 'draw') {
      fabricCanvas.freeDrawingBrush.width = 3; // Increased width for better visibility
      fabricCanvas.freeDrawingBrush.color = '#ff3333'; // Brighter red color
    } else if (tool === 'highlight') {
      fabricCanvas.freeDrawingBrush.width = 25; // Increased width for better highlighting
      fabricCanvas.freeDrawingBrush.color = 'rgba(255, 255, 0, 0.5)'; // More visible yellow
    } else if (tool === 'text') {
      const text = new IText('Click to edit', {
        left: fabricCanvas.width! / 2,
        top: fabricCanvas.height! / 2,
        fontSize: 24, // Increased font size
        fill: '#ff3333', // Matching red color
        originX: 'center',
        originY: 'center',
      });
      fabricCanvas.add(text);
      fabricCanvas.setActiveObject(text);
      text.enterEditing();
      text.selectAll();
    } else if (tool === 'eraser') {
      fabricCanvas.freeDrawingBrush.width = 25; // Increased eraser size
      fabricCanvas.freeDrawingBrush.color = 'rgba(0,0,0,0)';
    }

    fabricCanvas.renderAll();
  };

  if (!isRecording) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-auto"
        style={{ 
          zIndex: 1000,
          touchAction: 'none'
        }}
      />
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[1001] bg-black/90 rounded-lg p-3 flex gap-3">
        <Button
          variant={activeTool === 'draw' ? 'default' : 'secondary'}
          size="icon"
          onClick={() => handleToolClick('draw')}
          className="hover:bg-primary/90"
        >
          <Pencil className="h-5 w-5" />
        </Button>
        <Button
          variant={activeTool === 'highlight' ? 'default' : 'secondary'}
          size="icon"
          onClick={() => handleToolClick('highlight')}
          className="hover:bg-primary/90"
        >
          <Highlighter className="h-5 w-5" />
        </Button>
        <Button
          variant={activeTool === 'text' ? 'default' : 'secondary'}
          size="icon"
          onClick={() => handleToolClick('text')}
          className="hover:bg-primary/90"
        >
          <Type className="h-5 w-5" />
        </Button>
        <Button
          variant={activeTool === 'eraser' ? 'default' : 'secondary'}
          size="icon"
          onClick={() => handleToolClick('eraser')}
          className="hover:bg-primary/90"
        >
          <Eraser className="h-5 w-5" />
        </Button>
      </div>
    </>
  );
};