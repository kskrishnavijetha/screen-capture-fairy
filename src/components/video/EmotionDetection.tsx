import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Heart, Star, Laugh, Frown, 
  PartyPopper, ThumbsUp, ThumbsDown,
  Flame, Coffee, Battery, RefreshCcw
} from 'lucide-react';
import { ConfidenceThresholdControls } from './ConfidenceThresholdControls';
import { extractFrames } from '@/utils/frameExtraction';

interface EmotionHighlight {
  timestamp: number;
  emotion: string;
  confidence: number;
  source: 'visual' | 'audio' | 'text';
}

interface EmotionDetectionProps {
  videoId: string;
  currentTime: number;
  onHighlightClick: (time: number) => void;
  transcription?: string;
}

const EMOTIONS = {
  excited: { icon: PartyPopper, color: 'text-yellow-500' },
  happy: { icon: Heart, color: 'text-pink-500' },
  neutral: { icon: Coffee, color: 'text-gray-500' },
  sad: { icon: Frown, color: 'text-blue-500' },
  angry: { icon: Flame, color: 'text-red-500' },
  energetic: { icon: Battery, color: 'text-green-500' },
  enthusiastic: { icon: Star, color: 'text-purple-500' },
  bored: { icon: ThumbsDown, color: 'text-slate-500' },
  engaged: { icon: ThumbsUp, color: 'text-indigo-500' },
  amused: { icon: Laugh, color: 'text-orange-500' },
};

export const EmotionDetection = ({ 
  videoId, 
  currentTime, 
  onHighlightClick,
  transcription = '' 
}: EmotionDetectionProps) => {
  const [highlights, setHighlights] = useState<EmotionHighlight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = document.querySelector(`video[src*="${videoId}"]`);
    if (video instanceof HTMLVideoElement) {
      setVideoElement(video);
    }
  }, [videoId]);

  const getEmotionIcon = (emotion: string) => {
    const emotionConfig = EMOTIONS[emotion as keyof typeof EMOTIONS] || EMOTIONS.neutral;
    const Icon = emotionConfig.icon;
    return <Icon className={`h-4 w-4 ${emotionConfig.color}`} />;
  };

  const analyzeEmotion = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);
      
      if (!videoElement) {
        throw new Error('Video element not found');
      }

      console.log('Starting frame extraction...');
      const frameData = await extractFrames(videoElement);
      console.log('Frames extracted:', frameData.length);
      
      console.log('Calling emotion analysis function...');
      const { data, error: functionError } = await supabase.functions.invoke('analyze-emotion-enhanced', {
        body: { 
          videoId,
          transcription,
          frameData
        }
      });

      if (functionError) {
        throw functionError;
      }

      if (!data?.highlights) {
        throw new Error('No highlights data received');
      }

      console.log('Analysis complete:', data);
      setHighlights(data.highlights);
      toast({
        title: "Analysis complete",
        description: "Emotional highlights have been detected in your video",
      });
    } catch (error) {
      console.error('Error analyzing emotions:', error);
      setError(error instanceof Error ? error.message : 'Could not analyze emotions in the video');
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: error instanceof Error ? error.message : 'Could not analyze emotions in the video',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredHighlights = highlights.filter(h => h.confidence >= confidenceThreshold);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Emotional Highlights</h3>
        <Button 
          variant={error ? "destructive" : "default"}
          size="sm"
          onClick={analyzeEmotion}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              {error ? 'Retry Analysis' : 'Analyze Emotions'}
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <ConfidenceThresholdControls
        threshold={confidenceThreshold}
        onThresholdChange={setConfidenceThreshold}
      />

      <div className="space-y-2">
        {filteredHighlights.map((highlight, index) => (
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
              <Badge variant="outline" className="text-xs">
                {highlight.source}
              </Badge>
            </div>
            <span className="text-sm text-muted-foreground">
              {new Date(highlight.timestamp * 1000).toISOString().substr(14, 5)}
            </span>
          </div>
        ))}
        
        {filteredHighlights.length === 0 && !isAnalyzing && !error && (
          <div className="text-center text-muted-foreground py-4">
            No emotional highlights detected yet
          </div>
        )}
      </div>
    </Card>
  );
};