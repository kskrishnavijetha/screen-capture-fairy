import React, { useEffect, useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { Mic, MicOff } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface VoiceCommandListenerProps {
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onHighlight: () => void;
  isRecording: boolean;
  isPaused: boolean;
}

export const VoiceCommandListener: React.FC<VoiceCommandListenerProps> = ({
  onPause,
  onResume,
  onStop,
  onHighlight,
  isRecording,
  isPaused,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = false;
        setRecognition(recognitionInstance);
      }
    }
  }, []);

  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event) => {
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      console.log('Voice command detected:', command);

      if (command.includes('pause') || command.includes('paws')) {
        if (!isPaused && isRecording) {
          onPause();
          toast({
            title: "Voice Command",
            description: "Recording paused",
          });
        }
      } else if (command.includes('resume') || command.includes('continue')) {
        if (isPaused && isRecording) {
          onResume();
          toast({
            title: "Voice Command",
            description: "Recording resumed",
          });
        }
      } else if (command.includes('stop')) {
        if (isRecording) {
          onStop();
          toast({
            title: "Voice Command",
            description: "Recording stopped",
          });
        }
      } else if (command.includes('highlight') || command.includes('mark')) {
        if (isRecording) {
          onHighlight();
          toast({
            title: "Voice Command",
            description: "Moment highlighted",
          });
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast({
        variant: "destructive",
        title: "Voice Command Error",
        description: "Failed to process voice command",
      });
    };

    recognition.onend = () => {
      if (isListening) {
        recognition.start();
      }
    };

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
    };
  }, [recognition, isRecording, isPaused, onPause, onResume, onStop, onHighlight]);

  const toggleListening = () => {
    if (!recognition) {
      toast({
        variant: "destructive",
        title: "Not Supported",
        description: "Voice commands are not supported in your browser",
      });
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      toast({
        title: "Voice Commands Disabled",
        description: "No longer listening for voice commands",
      });
    } else {
      recognition.start();
      setIsListening(true);
      toast({
        title: "Voice Commands Enabled",
        description: "Listening for voice commands",
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleListening}
      className={`${isListening ? 'bg-primary/10' : ''}`}
      title={isListening ? 'Disable voice commands' : 'Enable voice commands'}
    >
      {isListening ? (
        <Mic className="h-4 w-4 text-primary" />
      ) : (
        <MicOff className="h-4 w-4" />
      )}
    </Button>
  );
};