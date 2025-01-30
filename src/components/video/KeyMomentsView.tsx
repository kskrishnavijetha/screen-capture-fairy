import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { formatTime } from '@/utils/timeUtils';

interface KeyMoment {
  id: string;
  video_id: string;
  timestamp: number;
  moment_type: string;
  description: string;
  confidence: number;
}

interface KeyMomentsViewProps {
  videoId: string;
  currentTime: number;
  onHighlightClick: (time: number) => void;
  transcription: string;
}

export const KeyMomentsView: React.FC<KeyMomentsViewProps> = ({
  videoId,
  currentTime,
  onHighlightClick,
  transcription
}) => {
  const [keyMoments, setKeyMoments] = useState<KeyMoment[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    loadKeyMoments();
  }, [videoId]);

  const loadKeyMoments = async () => {
    try {
      const { data, error } = await supabase
        .from('video_key_moments')
        .select('*')
        .eq('video_id', videoId)
        .order('timestamp');

      if (error) throw error;
      setKeyMoments(data || []);
    } catch (error) {
      console.error('Error loading key moments:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load key moments"
      });
    }
  };

  const analyzeKeyMoments = async () => {
    setIsAnalyzing(true);
    try {
      const response = await supabase.functions.invoke('detect-key-moments', {
        body: { videoId, transcription }
      });

      if (response.error) throw response.error;
      await loadKeyMoments();
      
      toast({
        title: "Analysis Complete",
        description: "Key moments have been identified"
      });
    } catch (error) {
      console.error('Error analyzing key moments:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to analyze key moments"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateHighlightReel = () => {
    // This is a placeholder for highlight reel generation
    // We'll implement this feature in the next iteration
    toast({
      title: "Coming Soon",
      description: "Highlight reel generation will be available soon"
    });
  };

  if (keyMoments.length === 0 && !isAnalyzing) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Key Moments</h3>
        <Button 
          onClick={analyzeKeyMoments} 
          disabled={!transcription || isAnalyzing}
        >
          {isAnalyzing ? "Analyzing..." : "Analyze Key Moments"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Key Moments</h3>
        <Button
          variant="outline"
          onClick={generateHighlightReel}
          disabled={keyMoments.length === 0}
        >
          Generate Highlight Reel
        </Button>
      </div>

      <ScrollArea className="h-[200px] rounded-md border p-4">
        <div className="space-y-2">
          {keyMoments.map((moment) => (
            <div
              key={moment.id}
              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors
                ${Math.abs(currentTime - moment.timestamp) < 0.5 ? 'bg-primary/20' : 'hover:bg-accent'}`}
              onClick={() => onHighlightClick(moment.timestamp)}
            >
              <div className="flex flex-col">
                <span className="font-medium">{moment.description}</span>
                <span className="text-sm text-muted-foreground">
                  Type: {moment.moment_type.replace('_', ' ')}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatTime(moment.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};