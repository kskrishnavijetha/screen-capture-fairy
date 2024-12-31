import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Circle, IText } from 'fabric';
import { Button } from "@/components/ui/button";
import { Pencil, Type, Highlighter, Eraser, Undo, GripHorizontal } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

interface AnnotationToolsProps {
  isRecording: boolean;
}

export const AnnotationTools = ({ isRecording }: AnnotationToolsProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<'draw' | 'text' | 'highlight' | 'eraser' | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [position, setPosition] = useState({ x: window.innerWidth / 2 - 150, y: window.innerHeight - 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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
    
    // Save initial state
    setHistory([JSON.stringify(canvas.toJSON())]);
    
    // Add event listener for object modifications
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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof Element && e.target.closest('.drag-handle')) {
      setIsDragging(true);
      const toolbar = toolbarRef.current?.getBoundingClientRect();
      if (toolbar) {
        setDragOffset({
          x: e.clientX - toolbar.left,
          y: e.clientY - toolbar.top
        });
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && toolbarRef.current) {
      const newX = Math.min(
        Math.max(0, e.clientX - dragOffset.x),
        window.innerWidth - toolbarRef.current.offsetWidth
      );
      const newY = Math.min(
        Math.max(0, e.clientY - dragOffset.y),
        window.innerHeight - toolbarRef.current.offsetHeight
      );
      
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

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

    // Remove the last state from history
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);

    // Load the previous state
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
      <div
        ref={toolbarRef}
        className="fixed flex gap-3 bg-black/90 rounded-lg p-3 cursor-move transition-all duration-200"
        style={{
          left: position.x,
          top: position.y,
          zIndex: 1001,
          transform: 'translate(0, 0)',
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="drag-handle flex items-center mr-2 cursor-grab active:cursor-grabbing">
          <GripHorizontal className="h-5 w-5 text-gray-400" />
        </div>
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
        <Button
          variant="secondary"
          size="icon"
          onClick={handleUndo}
          disabled={history.length <= 1}
          className="hover:bg-primary/90"
        >
          <Undo className="h-5 w-5" />
        </Button>
      </div>
    </>
  );
};
