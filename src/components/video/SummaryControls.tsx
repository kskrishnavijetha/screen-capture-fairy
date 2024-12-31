import React, { useState } from 'react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { pipeline, type AutomaticSpeechRecognitionOutput, type SummarizationOutput } from '@huggingface/transformers';

interface SummaryControlsProps {
  videoRef: React.RefObject<HTMLVideoElement>;
}

export const SummaryControls = ({ videoRef }: SummaryControlsProps) => {
  const [summary, setSummary] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateSummary = async () => {
    if (!videoRef.current) return;

    setIsGenerating(true);
    try {
      // Create a transcriber pipeline
      const transcriber = await pipeline(
        'automatic-speech-recognition',
        'openai/whisper-tiny.en',
        { device: 'cpu' }
      );

      // Get audio from video element
      const audioContext = new AudioContext();
      const source = audioContext.createMediaElementSource(videoRef.current);
      const destination = audioContext.createMediaStreamDestination();
      source.connect(destination);

      // Get audio data as ArrayBuffer
      const audioData = await fetch(URL.createObjectURL(
        new Blob([destination.stream], { type: 'audio/wav' })
      )).then(res => res.arrayBuffer());

      // Transcribe the audio
      const transcription = await transcriber(audioData);
      const transcriptionText = Array.isArray(transcription) 
        ? transcription[0].text 
        : (transcription as AutomaticSpeechRecognitionOutput).text;

      // Create a summarization pipeline
      const summarizer = await pipeline(
        'summarization',
        'facebook/bart-large-cnn'
      );

      // Generate summary with proper types
      const result = await summarizer(transcriptionText, {
        max_length: 130,
        min_length: 30,
        do_sample: false,
        num_beams: 4,
        temperature: 1.0,
        top_k: 50,
        top_p: 0.95,
        repetition_penalty: 1.0,
        length_penalty: 1.0,
        no_repeat_ngram_size: 3
      });

      const summaryText = Array.isArray(result) 
        ? (result[0] as { summary_text: string }).summary_text 
        : (result as { summary_text: string }).summary_text;
      
      setSummary(summaryText);
      toast({
        title: 'Summary Generated',
        description: 'Video content has been successfully summarized.',
      });
    } catch (error) {
      console.error('Summarization error:', error);
      toast({
        variant: 'destructive',
        title: 'Summarization Error',
        description: 'Failed to generate summary. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={generateSummary}
        variant="secondary"
        disabled={isGenerating}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Generating Summary...
          </>
        ) : (
          'Generate AI Summary'
        )}
      </Button>

      {summary && (
        <ScrollArea className="h-32 rounded-md border p-4">
          <h4 className="font-medium mb-2">Video Summary</h4>
          <p className="text-sm text-muted-foreground">{summary}</p>
        </ScrollArea>
      )}
    </div>
  );
};