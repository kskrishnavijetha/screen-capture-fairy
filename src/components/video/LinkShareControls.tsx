import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link2, Copy, Check } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

interface LinkShareControlsProps {
  recordedBlob: Blob | null;
}

export const LinkShareControls = ({ recordedBlob }: LinkShareControlsProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const [shareableLink, setShareableLink] = useState<string>('');

  const generateShareableLink = () => {
    if (!recordedBlob) {
      toast({
        variant: "destructive",
        title: "No video to share",
        description: "Please record or process a video first.",
      });
      return;
    }

    const simulatedLink = `https://example.com/share/${Math.random().toString(36).substring(7)}`;
    setShareableLink(simulatedLink);
    toast({
      title: "Link Generated",
      description: "Shareable link has been generated successfully.",
    });
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
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Failed to copy link to clipboard.",
      });
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <Button
        onClick={generateShareableLink}
        disabled={!recordedBlob}
        variant="outline"
        className="w-full"
      >
        <Link2 className="w-4 h-4 mr-2" />
        Generate Shareable Link
      </Button>

      {shareableLink && (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={shareableLink}
            readOnly
            className="flex-1 px-3 py-2 border rounded-md text-sm"
          />
          <Button
            onClick={copyToClipboard}
            variant="outline"
            size="icon"
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