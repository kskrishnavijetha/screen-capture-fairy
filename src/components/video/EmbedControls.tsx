import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Code, Copy, Check } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface EmbedControlsProps {
  recordedBlob: Blob | null;
}

export const EmbedControls = ({ recordedBlob }: EmbedControlsProps) => {
  const [embedCode, setEmbedCode] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  const generateEmbedCode = () => {
    if (!recordedBlob) {
      toast({
        variant: "destructive",
        title: "No video to embed",
        description: "Please record or process a video first.",
      });
      return;
    }

    // In a real implementation, this would upload the video to a server
    // and return a permanent URL. For now, we'll simulate it:
    const simulatedVideoUrl = `https://example.com/embed/${Math.random().toString(36).substring(7)}`;
    const embedCode = `<iframe 
  width="560" 
  height="315" 
  src="${simulatedVideoUrl}" 
  frameborder="0" 
  allowfullscreen
></iframe>`;
    
    setEmbedCode(embedCode);
    toast({
      title: "Embed Code Generated",
      description: "HTML embed code has been generated successfully.",
    });
  };

  const copyToClipboard = async () => {
    if (!embedCode) {
      toast({
        variant: "destructive",
        title: "No embed code",
        description: "Please generate the embed code first.",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(embedCode);
      setIsCopied(true);
      toast({
        title: "Code Copied",
        description: "The embed code has been copied to your clipboard.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Failed to copy embed code to clipboard.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={generateEmbedCode}
        disabled={!recordedBlob}
        variant="outline"
        className="w-full"
      >
        <Code className="w-4 h-4 mr-2" />
        Generate Embed Code
      </Button>

      {embedCode && (
        <div className="space-y-2">
          <Textarea
            value={embedCode}
            readOnly
            className="font-mono text-sm"
            rows={4}
          />
          <Button
            onClick={copyToClipboard}
            variant="outline"
            className="w-full"
          >
            {isCopied ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            {isCopied ? "Copied!" : "Copy Code"}
          </Button>
        </div>
      )}
    </div>
  );
};