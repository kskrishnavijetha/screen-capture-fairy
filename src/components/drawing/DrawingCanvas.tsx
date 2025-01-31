import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Circle, Rect } from 'fabric';
import { DrawingToolbar } from './DrawingToolbar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface DrawingCanvasProps {
  videoId: string;
  isRecording: boolean;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ videoId, isRecording }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeColor, setActiveColor] = useState('#FF0000');
  const [activeTool, setActiveTool] = useState<'select' | 'draw' | 'rectangle' | 'circle'>('draw');

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 'transparent',
      isDrawingMode: true,
    });

    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = 2;

    setFabricCanvas(canvas);

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`canvas-${videoId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        console.log('Canvas sync state:', state);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user: videoId, timestamp: new Date().toISOString() });
        }
      });

    return () => {
      canvas.dispose();
      supabase.removeChannel(channel);
    };
  }, [videoId]);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === 'draw';
    
    if (activeTool === 'draw' && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeColor;
      fabricCanvas.freeDrawingBrush.width = 2;
    }
  }, [activeTool, activeColor, fabricCanvas]);

  const handleToolChange = (tool: typeof activeTool) => {
    setActiveTool(tool);

    if (!fabricCanvas) return;

    if (tool === 'rectangle') {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: 'transparent',
        stroke: activeColor,
        strokeWidth: 2,
        width: 100,
        height: 100,
      });
      fabricCanvas.add(rect);
      fabricCanvas.setActiveObject(rect);
    } else if (tool === 'circle') {
      const circle = new Circle({
        left: 100,
        top: 100,
        fill: 'transparent',
        stroke: activeColor,
        strokeWidth: 2,
        radius: 50,
      });
      fabricCanvas.add(circle);
      fabricCanvas.setActiveObject(circle);
    }
  };

  const saveCanvasState = async () => {
    if (!fabricCanvas) return;

    try {
      const { data, error } = await supabase
        .from('annotations_canvas')
        .upsert({
          video_id: videoId,
          canvas_data: fabricCanvas.toJSON(),
          created_by: (await supabase.auth.getUser()).data.user?.id,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Annotations saved",
        description: "Your drawings have been saved successfully",
      });
    } catch (error) {
      console.error('Error saving canvas state:', error);
      toast({
        title: "Error saving annotations",
        description: "There was a problem saving your drawings",
        variant: "destructive",
      });
    }
  };

  const clearCanvas = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = 'transparent';
    fabricCanvas.renderAll();
  };

  return (
    <div className="absolute inset-0 pointer-events-auto">
      <DrawingToolbar
        activeTool={activeTool}
        activeColor={activeColor}
        onToolChange={handleToolChange}
        onColorChange={setActiveColor}
        onClear={clearCanvas}
        onSave={saveCanvasState}
        isRecording={isRecording}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 pointer-events-auto"
      />
    </div>
  );
};