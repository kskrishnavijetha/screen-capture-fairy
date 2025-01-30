import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LiveCaptionsProps {
  isRecording: boolean;
  audioStream?: MediaStream;
}

const SUPPORTED_LANGUAGES = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  nl: 'Dutch',
  pl: 'Polish',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese',
};

export const LiveCaptions: React.FC<LiveCaptionsProps> = ({ 
  isRecording,
  audioStream 
}) => {
  const [captions, setCaptions] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const transcriptionTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!audioStream || !isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      return;
    }

    try {
      mediaRecorderRef.current = new MediaRecorder(audioStream, {
        mimeType: 'audio/webm',
      });

      mediaRecorderRef.current.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1];
            
            try {
              const { data, error } = await supabase.functions.invoke('live-transcription', {
                body: { 
                  audioChunk: base64Audio,
                  language: selectedLanguage
                }
              });

              if (error) throw error;
              if (data.text) {
                setCaptions(prev => `${prev} ${data.text}`.trim());
                
                // Clear captions after 5 seconds of no new text
                if (transcriptionTimeoutRef.current) {
                  clearTimeout(transcriptionTimeoutRef.current);
                }
                transcriptionTimeoutRef.current = setTimeout(() => {
                  setCaptions('');
                }, 5000);
              }
            } catch (error) {
              console.error('Transcription error:', error);
              toast({
                variant: "destructive",
                title: "Transcription Error",
                description: "Failed to generate captions. Please try again."
              });
            }
          };
          reader.readAsDataURL(event.data);
        }
      };

      // Start recording in 1-second chunks
      mediaRecorderRef.current.start(1000);
    } catch (error) {
      console.error('MediaRecorder error:', error);
      toast({
        variant: "destructive",
        title: "Recording Error",
        description: "Failed to initialize caption recording."
      });
    }

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (transcriptionTimeoutRef.current) {
        clearTimeout(transcriptionTimeoutRef.current);
      }
    };
  }, [isRecording, audioStream, selectedLanguage]);

  return (
    <div className="relative w-full">
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4">
        <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Select
              value={selectedLanguage}
              onValueChange={setSelectedLanguage}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                  <SelectItem key={code} value={code}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-h-[60px] text-center">
            {captions || (isRecording ? 'Listening...' : 'Start recording to see captions')}
          </div>
        </div>
      </div>
    </div>
  );
};