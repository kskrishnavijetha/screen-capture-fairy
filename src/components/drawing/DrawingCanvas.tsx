import React, { useEffect, useRef, useState } from 'react';
import { Canvas, Circle, Rect, Line, util, type FabricObject } from 'fabric';
import type { DrawingTool } from './DrawingToolbar';
import { supabase } from '@/integrations/supabase/client';

interface DrawingCanvasProps {
  activeTool: DrawingTool;
  activeColor: string;
  videoId?: string;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  activeTool,
  activeColor,
  videoId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    fabricRef.current = new Canvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      isDrawingMode: activeTool === 'pen' || activeTool === 'highlighter',
    });

    const handleResize = () => {
      if (fabricRef.current) {
        fabricRef.current.setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    if (videoId) {
      setupRealtimeCollaboration();
    }

    return () => {
      fabricRef.current?.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [videoId]);

  useEffect(() => {
    if (!fabricRef.current) return;

    fabricRef.current.isDrawingMode = activeTool === 'pen' || activeTool === 'highlighter';
    
    if (fabricRef.current.freeDrawingBrush) {
      fabricRef.current.freeDrawingBrush.color = activeColor;
      fabricRef.current.freeDrawingBrush.width = activeTool === 'highlighter' ? 20 : 2;
      if (activeTool === 'highlighter') {
        fabricRef.current.freeDrawingBrush.color = activeColor + '80';
      }
    }
  }, [activeTool, activeColor]);

  const setupRealtimeCollaboration = () => {
    if (!videoId) return;

    const channel = supabase.channel(`drawing:${videoId}`)
      .on('broadcast', { event: 'drawing-update' }, ({ payload }) => {
        if (!fabricRef.current) return;

        const options = {
          crossOrigin: 'anonymous',
          signal: new AbortController().signal
        };

        util.enlivenObjects([payload.object], options)
          .then((objects: FabricObject[]) => {
            if (objects[0]) {
              fabricRef.current?.add(objects[0]);
            }
          })
          .catch(console.error);
      })
      .subscribe();

    if (fabricRef.current) {
      fabricRef.current.on('object:added', (e) => {
        if (!e.target) return;
        channel.send({
          type: 'broadcast',
          event: 'drawing-update',
          payload: {
            object: e.target.toJSON(),
          },
        });
      });
    }

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!fabricRef.current || activeTool === 'pen' || activeTool === 'highlighter') return;

    const pointer = fabricRef.current.getPointer(e.nativeEvent);
    setIsDrawing(true);

    switch (activeTool) {
      case 'square':
        const rect = new Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: 'transparent',
          stroke: activeColor,
          strokeWidth: 2,
        });
        fabricRef.current.add(rect);
        fabricRef.current.setActiveObject(rect);
        break;

      case 'circle':
        const circle = new Circle({
          left: pointer.x,
          top: pointer.y,
          radius: 0,
          fill: 'transparent',
          stroke: activeColor,
          strokeWidth: 2,
        });
        fabricRef.current.add(circle);
        fabricRef.current.setActiveObject(circle);
        break;

      case 'arrow':
        const line = new Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          stroke: activeColor,
          strokeWidth: 2,
        });
        fabricRef.current.add(line);
        fabricRef.current.setActiveObject(line);
        break;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!fabricRef.current || !isDrawing) return;

    const pointer = fabricRef.current.getPointer(e.nativeEvent);
    const activeObj = fabricRef.current.getActiveObject();

    if (!activeObj) return;

    switch (activeTool) {
      case 'square':
        if (activeObj instanceof Rect) {
          activeObj.set({
            width: Math.abs(pointer.x - activeObj.left!),
            height: Math.abs(pointer.y - activeObj.top!),
          });
        }
        break;

      case 'circle':
        if (activeObj instanceof Circle) {
          const radius = Math.sqrt(
            Math.pow(pointer.x - activeObj.left!, 2) +
            Math.pow(pointer.y - activeObj.top!, 2)
          );
          activeObj.set({ radius });
        }
        break;

      case 'arrow':
        if (activeObj instanceof Line) {
          activeObj.set({
            x2: pointer.x,
            y2: pointer.y,
          });
        }
        break;
    }

    fabricRef.current.requestRenderAll();
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-50 pointer-events-auto"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    />
  );
};