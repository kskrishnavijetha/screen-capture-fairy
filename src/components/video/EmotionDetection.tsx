import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Heart, Star, Laugh, Frown } from 'lucide-react';

interface EmotionHighlight {
  timestamp: number;
  emotion: 'excited' | 'happy' | 'neutral' | 'sad';
  confidence: number;
}

interface EmotionDetectionProps {
  videoId: string;
  currentTime: number;
  onHighlightClick: (time: number) => void;
  transcription?: string;
}

export const EmotionDetection = ({ 
  videoId, 
  currentTime, 
  onHighlightClick,
  transcription = '' 
}: EmotionDetectionProps) => {
  const [highlights, setHighlights] = useState<EmotionHighlight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case 'excited':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'happy':
        return <Heart className="h-4 w-4 text-pink-500" />;
      case 'neutral':
        return <Star className="h-4 w-4 text-gray-500" />;
      case 'sad':
        return <Frown className="h-4 w-4 text-blue-500" />;
      default:
        return <Laugh className="h-4 w-4 text-purple-500" />;
    }
  };

  const analyzeEmotion = async () => {
    try {
      setIsAnalyzing(true);
      
      const { data, error } = await supabase.functions.invoke('analyze-emotion', {
        body: { 
          videoId,
          transcription
        }
      });

      if (error) throw error;

      setHighlights(data.highlights);
      toast({
        title: "Analysis complete",
        description: "Emotional highlights have been detected in your video",
      });
    } catch (error) {
      console.error('Error analyzing emotions:', error);
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: "Could not analyze emotions in the video",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Emotional Highlights</h3>
        <Badge 
          variant={isAnalyzing ? "secondary" : "default"}
          className="cursor-pointer"
          onClick={analyzeEmotion}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Emotions'}
        </Badge>
      </div>

      <div className="space-y-2">
        {highlights.map((highlight, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-2 hover:bg-accent rounded-lg cursor-pointer ${
              Math.abs(currentTime - highlight.timestamp) < 1 ? 'bg-accent' : ''
            }`}
            onClick={() => onHighlightClick(highlight.timestamp)}
          >
            <div className="flex items-center gap-2">
              {getEmotionIcon(highlight.emotion)}
              <span className="capitalize">{highlight.emotion}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {new Date(highlight.timestamp * 1000).toISOString().substr(14, 5)}
            </span>
          </div>
        ))}
        
        {highlights.length === 0 && !isAnalyzing && (
          <div className="text-center text-muted-foreground py-4">
            No emotional highlights detected yet
          </div>
        )}
      </div>
    </Card>
  );
};