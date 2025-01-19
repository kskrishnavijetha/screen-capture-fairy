import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link2, Copy, Check } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface LinkShareControlsProps {
  recordedBlob: Blob | null;
}

export const LinkShareControls = ({ recordedBlob }: LinkShareControlsProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const [shareableLink, setShareableLink] = useState<string>('');

  const generateShareableLink = async () => {
    if (!recordedBlob) {
      toast({
        variant: "destructive",
        title: "No video to share",
        description: "Please record or process a video first.",
      });
      return;
    }

    try {
      // Create a temporary URL for the video blob
      const url = URL.createObjectURL(recordedBlob);
      // In a production environment, you would want to upload this to a server
      // and generate a permanent link instead of using a blob URL
      setShareableLink(url);
      toast({
        title: "Link Generated",
        description: "Shareable link has been generated successfully.",
      });
    } catch (error) {
      console.error('Error generating link:', error);
      toast({
        variant: "destructive",
        title: "Error generating link",
        description: "Failed to generate shareable link.",
      });
    }
  };

  const copyToClipboard = async () => {
    if (!shareableLink) {
      toast({
        variant: "destructive",
        title: "No link to copy",
        description: "Please generate a shareable link first.",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(shareableLink);
      setIsCopied(true);
      toast({
        title: "Link Copied",
        description: "The shareable link has been copied to your clipboard.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Failed to copy link to clipboard.",
      });
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={generateShareableLink}
        disabled={!recordedBlob}
        variant="outline"
        className="w-full justify-start bg-background hover:bg-accent"
      >
        <Link2 className="w-4 h-4 mr-2" />
        Generate Shareable Link
      </Button>

      {shareableLink && (
        <div className="flex gap-2">
          <Input
            value={shareableLink}
            readOnly
            className="flex-1 font-mono text-sm"
          />
          <Button
            onClick={copyToClipboard}
            variant="outline"
            size="icon"
            className="shrink-0"
          >
            {isCopied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
};