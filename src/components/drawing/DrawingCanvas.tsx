import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas } from 'fabric';
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

    try {
      const canvas = new FabricCanvas(canvasRef.current, {
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 'transparent',
        isDrawingMode: true,
      });

      // Initialize the canvas with default settings
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = activeColor;
        canvas.freeDrawingBrush.width = 2;
      }

      setFabricCanvas(canvas);

      // Handle window resize
      const handleResize = () => {
        canvas.setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        canvas.dispose();
      };
    } catch (error) {
      console.error('Error initializing canvas:', error);
      toast({
        title: "Error",
        description: "Failed to initialize drawing canvas",
        variant: "destructive",
      });
    }
  }, [activeColor]);

  useEffect(() => {
    if (!fabricCanvas) return;

    try {
      fabricCanvas.isDrawingMode = activeTool === 'draw';
      
      if (activeTool === 'draw' && fabricCanvas.freeDrawingBrush) {
        fabricCanvas.freeDrawingBrush.color = activeColor;
        fabricCanvas.freeDrawingBrush.width = 2;
      }
    } catch (error) {
      console.error('Error updating canvas settings:', error);
    }
  }, [activeTool, activeColor, fabricCanvas]);

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
        onToolChange={setActiveTool}
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