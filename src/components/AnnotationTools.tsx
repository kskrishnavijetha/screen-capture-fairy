import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, IText } from 'fabric';
import { toast } from "@/components/ui/use-toast";
import { DraggableToolbar } from './annotation/DraggableToolbar';
import { useDraggable } from '@/hooks/useDraggable';

interface AnnotationToolsProps {
  isRecording: boolean;
}

export const AnnotationTools = ({ isRecording }: AnnotationToolsProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<'draw' | 'text' | 'highlight' | 'eraser' | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  
  const initialPosition = {
    x: window.innerWidth / 2 - 150,
    y: window.innerHeight - 100
  };
  
  const { position, handleMouseDown } = useDraggable(initialPosition);

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
    
    setHistory([JSON.stringify(canvas.toJSON())]);
    
    canvas.on('object:added', () => {
      const currentState = JSON.stringify(canvas.toJSON());
      setHistory(prev => [...prev, currentState]);
    });

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
      fabricCanvas.freeDrawingBrush.width = 3;
      fabricCanvas.freeDrawingBrush.color = '#ff3333';
    } else if (tool === 'highlight') {
      fabricCanvas.freeDrawingBrush.width = 25;
      fabricCanvas.freeDrawingBrush.color = 'rgba(255, 255, 0, 0.5)';
    } else if (tool === 'text') {
      const text = new IText('Click to edit', {
        left: fabricCanvas.width! / 2,
        top: fabricCanvas.height! / 2,
        fontSize: 24,
        fill: '#ff3333',
        originX: 'center',
        originY: 'center',
      });
      fabricCanvas.add(text);
      fabricCanvas.setActiveObject(text);
      text.enterEditing();
      text.selectAll();
    } else if (tool === 'eraser') {
      fabricCanvas.freeDrawingBrush.width = 25;
      fabricCanvas.freeDrawingBrush.color = 'rgba(0,0,0,0)';
    }

    fabricCanvas.renderAll();
  };

  const handleUndo = () => {
    if (!fabricCanvas || history.length <= 1) return;

    const newHistory = history.slice(0, -1);
    setHistory(newHistory);

    fabricCanvas.loadFromJSON(JSON.parse(newHistory[newHistory.length - 1]), () => {
      fabricCanvas.renderAll();
      toast({
        title: "Action undone",
        description: "Your last annotation has been removed"
      });
    });
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
      <DraggableToolbar
        position={position}
        activeTool={activeTool}
        onToolClick={handleToolClick}
        onUndo={handleUndo}
        onMouseDown={handleMouseDown}
        canUndo={history.length > 1}
      />
    </>
  );
};