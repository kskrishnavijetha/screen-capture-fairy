import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Circle, Rect, Line } from 'fabric';
import { DrawingTool } from './DrawingToolbar';
import { toast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface DrawingCanvasProps {
  activeTool: DrawingTool;
  activeColor: string;
  videoId: string;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  activeTool,
  activeColor,
  videoId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      isDrawingMode: true,
      width: window.innerWidth,
      height: window.innerHeight,
    });

    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = activeTool === 'highlighter' ? 20 : 2;
    
    setFabricCanvas(canvas);

    // Subscribe to real-time updates
    const channel = supabase.channel(`drawing:${videoId}`)
      .on('broadcast', { event: 'draw' }, ({ payload }) => {
        if (payload.objectData) {
          fabric.util.enlivenObjects([payload.objectData], (objects) => {
            canvas.add(objects[0]);
            canvas.renderAll();
          });
        }
      })
      .subscribe();

    return () => {
      canvas.dispose();
      supabase.removeChannel(channel);
    };
  }, [videoId]);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = ['pen', 'highlighter', 'eraser'].includes(activeTool);
    
    if (fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeTool === 'eraser' ? '#ffffff' : activeColor;
      fabricCanvas.freeDrawingBrush.width = activeTool === 'highlighter' ? 20 : 2;
    }
  }, [activeTool, activeColor, fabricCanvas]);

  const handleAddShape = (type: 'rectangle' | 'circle' | 'arrow') => {
    if (!fabricCanvas) return;

    const center = fabricCanvas.getCenter();
    let object;

    switch (type) {
      case 'rectangle':
        object = new Rect({
          left: center.left,
          top: center.top,
          fill: activeColor,
          width: 100,
          height: 100,
        });
        break;
      case 'circle':
        object = new Circle({
          left: center.left,
          top: center.top,
          fill: activeColor,
          radius: 50,
        });
        break;
      case 'arrow':
        object = new Line([50, 50, 200, 200], {
          stroke: activeColor,
          strokeWidth: 2,
          selectable: true,
        });
        break;
    }

    if (object) {
      fabricCanvas.add(object);
      fabricCanvas.setActiveObject(object);
      fabricCanvas.renderAll();

      // Broadcast the new object to other users
      const channel = supabase.channel(`drawing:${videoId}`);
      channel.send({
        type: 'broadcast',
        event: 'draw',
        payload: {
          objectData: object.toObject(),
        },
      });
    }
  };

  useEffect(() => {
    if (!fabricCanvas) return;

    if (['rectangle', 'circle', 'arrow'].includes(activeTool)) {
      handleAddShape(activeTool as 'rectangle' | 'circle' | 'arrow');
    }
  }, [activeTool]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-10 pointer-events-auto"
    />
  );
};