import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Youtube, Video, Share2, Link2, Copy, Check } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Platform = 'youtube' | 'vimeo' | 'twitter';

interface ShareControlsProps {
  recordedBlob: Blob | null;
}

export const ShareControls = ({ recordedBlob }: ShareControlsProps) => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('youtube');
  const [isSharing, setIsSharing] = useState(false);
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

    // In a real implementation, this would upload the video to a server
    // and return a shareable link. For now, we'll simulate it:
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

  const handleShare = async () => {
    if (!recordedBlob) {
      toast({
        variant: "destructive",
        title: "No video to share",
        description: "Please record or process a video first.",
      });
      return;
    }

    setIsSharing(true);
    try {
      toast({
        title: "Sharing Integration",
        description: `This feature requires ${selectedPlatform} API integration. Please connect your app to the ${selectedPlatform} API to enable sharing.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sharing failed",
        description: "There was an error sharing your video.",
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Share to Platform</label>
        <Select
          value={selectedPlatform}
          onValueChange={(value: Platform) => setSelectedPlatform(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="youtube">
              <div className="flex items-center">
                <Youtube className="w-4 h-4 mr-2" />
                YouTube
              </div>
            </SelectItem>
            <SelectItem value="vimeo">
              <div className="flex items-center">
                <Video className="w-4 h-4 mr-2" />
                Vimeo
              </div>
            </SelectItem>
            <SelectItem value="twitter">
              <div className="flex items-center">
                <Share2 className="w-4 h-4 mr-2" />
                Twitter
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

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

      <Button
        onClick={handleShare}
        disabled={isSharing || !recordedBlob}
        className="w-full"
        variant="outline"
      >
        {isSharing ? (
          "Sharing..."
        ) : (
          <>
            <Share2 className="w-4 h-4 mr-2" />
            Share Video
          </>
        )}
      </Button>
    </div>
  );
};