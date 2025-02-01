import React, { useEffect, useRef, useState } from 'react';
import { Canvas, PencilBrush } from 'fabric';
import { DrawingToolbar } from './DrawingToolbar';
import { useToast } from "@/components/ui/use-toast";

interface DrawingCanvasProps {
  videoId: string;
  isRecording: boolean;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  videoId,
  isRecording
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<Canvas | null>(null);
  const [activeTool, setActiveTool] = useState<'draw' | 'select'>('draw');
  const [activeColor, setActiveColor] = useState('#ff0000');
  const [brushSize, setBrushSize] = useState(5);
  const { toast } = useToast();

  useEffect(() => {
    if (!canvasRef.current || fabricCanvas) return;

    const canvas = new Canvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 'transparent',
      isDrawingMode: true,
    });

    // Set initial cursor styles
    canvas.freeDrawingCursor = 'crosshair';
    canvas.defaultCursor = 'default';
    canvas.hoverCursor = 'pointer';

    // Create and set the brush
    const brush = new PencilBrush(canvas);
    brush.width = brushSize;
    brush.color = activeColor;
    canvas.freeDrawingBrush = brush;

    setFabricCanvas(canvas);

    // Cleanup
    return () => {
      canvas.dispose();
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (fabricCanvas) {
        fabricCanvas.setWidth(window.innerWidth);
        fabricCanvas.setHeight(window.innerHeight);
        fabricCanvas.renderAll();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fabricCanvas]);

  // Update canvas when tool changes
  useEffect(() => {
    if (!fabricCanvas) return;

    try {
      fabricCanvas.isDrawingMode = activeTool === 'draw';
      
      // Update cursor style based on active tool
      if (activeTool === 'draw') {
        fabricCanvas.freeDrawingCursor = 'crosshair';
        if (canvasRef.current) {
          canvasRef.current.style.cursor = 'crosshair';
        }
      } else {
        fabricCanvas.defaultCursor = 'default';
        if (canvasRef.current) {
          canvasRef.current.style.cursor = 'default';
        }
      }
      
      if (fabricCanvas.freeDrawingBrush) {
        fabricCanvas.freeDrawingBrush.color = activeColor;
        fabricCanvas.freeDrawingBrush.width = brushSize;
      }

      fabricCanvas.renderAll();
    } catch (error) {
      console.error('Error updating canvas:', error);
    }
  }, [activeTool, activeColor, brushSize]);

  const handleToolChange = (tool: 'draw' | 'select') => {
    setActiveTool(tool);
    if (fabricCanvas) {
      fabricCanvas.isDrawingMode = tool === 'draw';
      
      // Update cursor immediately
      if (canvasRef.current) {
        canvasRef.current.style.cursor = tool === 'draw' ? 'crosshair' : 'default';
      }
      
      fabricCanvas.renderAll();
    }
  };

  const handleColorChange = (color: string) => {
    setActiveColor(color);
    if (fabricCanvas && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = color;
    }
  };

  const handleBrushSizeChange = (size: number) => {
    setBrushSize(size);
    if (fabricCanvas && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.width = size;
    }
  };

  const handleClearCanvas = () => {
    if (!fabricCanvas) return;
    
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = 'transparent';
    fabricCanvas.renderAll();
    
    toast({
      title: "Canvas cleared",
      description: "All drawings have been cleared",
    });
  };

  return (
    <div className="fixed inset-0 pointer-events-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 pointer-events-auto"
        style={{ cursor: activeTool === 'draw' ? 'crosshair' : 'default' }}
      />
      <DrawingToolbar
        activeTool={activeTool}
        activeColor={activeColor}
        brushSize={brushSize}
        onToolChange={handleToolChange}
        onColorChange={handleColorChange}
        onBrushSizeChange={handleBrushSizeChange}
        onClearCanvas={handleClearCanvas}
      />
    </div>
  );
};