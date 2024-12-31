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
        'openai/whisper-tiny.en'
      );

      // Get audio from video element
      const audioContext = new AudioContext();
      const source = audioContext.createMediaElementSource(videoRef.current);
      const destination = audioContext.createMediaStreamDestination();
      source.connect(destination);

      // Convert MediaStream to audio data
      const mediaRecorder = new MediaRecorder(destination.stream);
      const chunks: BlobPart[] = [];
      
      await new Promise<void>((resolve) => {
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => resolve();
        mediaRecorder.start();
        setTimeout(() => mediaRecorder.stop(), 100); // Record a small chunk
      });

      const audioBlob = new Blob(chunks, { type: 'audio/wav' });
      const audioBuffer = await audioBlob.arrayBuffer();
      const audioArray = new Float32Array(audioBuffer);

      // Transcribe the audio
      const transcription = await transcriber(audioArray);
      const transcriptionText = Array.isArray(transcription) 
        ? transcription[0].text 
        : transcription.text;

      // Create a summarization pipeline
      const summarizer = await pipeline(
        'summarization',
        'facebook/bart-large-cnn'
      );

      // Generate summary with complete GenerationConfig
      const result = await summarizer(transcriptionText, {
        max_length: 130,
        min_length: 30,
        max_new_tokens: 130,
        min_new_tokens: 30,
        early_stopping: true,
        max_time: 60,
        do_sample: false,
        num_beams: 4,
        temperature: 1.0,
        top_k: 50,
        top_p: 0.95,
        typical_p: 1.0,
        epsilon_cutoff: 0.0,
        eta_cutoff: 0.0,
        diversity_penalty: 0.0,
        repetition_penalty: 1.0,
        encoder_repetition_penalty: 1.0,
        length_penalty: 1.0,
        no_repeat_ngram_size: 3,
        num_beam_groups: 1,
        penalty_alpha: 0,
        use_cache: true,
        forced_bos_token_id: null,
        forced_eos_token_id: null,
        remove_invalid_values: false,
        exponential_decay_length_penalty: null,
        suppress_tokens: null,
        begin_suppress_tokens: null,
        forced_decoder_ids: null,
        guidance_scale: 1.0,
        low_memory: false,
        pad_token_id: 0,
        bos_token_id: 0,
        eos_token_id: 2,
      });

      const summaryText = Array.isArray(result) 
        ? (result[0] as SummarizationOutput & { summary_text: string }).summary_text 
        : (result as SummarizationOutput & { summary_text: string }).summary_text;
      
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