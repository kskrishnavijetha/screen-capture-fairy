import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Share2, Youtube, Twitter, Facebook, Linkedin, Mail } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { Platform, platformConfigs } from './sharing/platformConfigs';
import { LinkShareControls } from './LinkShareControls';

interface ShareControlsProps {
  recordedBlob: Blob | null;
}

export const ShareControls = ({ recordedBlob }: ShareControlsProps) => {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async (platform: Platform) => {
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
      // Create a temporary URL for the video that will be valid for sharing
      const videoUrl = URL.createObjectURL(recordedBlob);

      switch (platform) {
        case 'youtube': {
          const uploadWindow = window.open('https://studio.youtube.com/channel/upload', '_blank');
          if (uploadWindow) {
            uploadWindow.focus();
          }
          toast({
            title: "YouTube Upload",
            description: "Please upload your video through YouTube Studio.",
          });
          break;
        }
        case 'twitter': {
          const shareText = encodeURIComponent('Check out my video!');
          const shareUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(window.location.href)}`;
          window.open(shareUrl, '_blank', 'width=550,height=420,noopener,noreferrer');
          break;
        }
        case 'facebook': {
          const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
          window.open(shareUrl, '_blank', 'width=550,height=420,noopener,noreferrer');
          break;
        }
        case 'linkedin': {
          const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
          window.open(shareUrl, '_blank', 'width=550,height=420,noopener,noreferrer');
          break;
        }
        case 'email': {
          const subject = encodeURIComponent('Check out my video');
          const body = encodeURIComponent(`I recorded this video and wanted to share it with you.\n\nView it here: ${window.location.href}`);
          window.location.href = `mailto:?subject=${subject}&body=${body}`;
          break;
        }
      }

      toast({
        title: "Share initiated",
        description: `Sharing to ${platformConfigs[platform].name} has been initiated.`,
      });
    } catch (error) {
      console.error('Sharing error:', error);
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
    <div className="space-y-4 bg-card p-4 rounded-lg border border-border">
      <h3 className="text-lg font-semibold mb-4">Share Video</h3>
      
      <LinkShareControls recordedBlob={recordedBlob} />
      
      <div className="space-y-2">
        {Object.entries(platformConfigs).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <Button
              key={key}
              onClick={() => handleShare(key as Platform)}
              disabled={isSharing || !recordedBlob}
              variant="outline"
              className="w-full justify-start bg-background hover:bg-accent"
            >
              <Icon className="w-4 h-4 mr-2" />
              Share to {config.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
};