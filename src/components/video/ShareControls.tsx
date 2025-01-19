import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Share2, Youtube, Twitter, Facebook, Linkedin, Mail } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { Platform, platformConfigs } from './sharing/platformConfigs';

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
      const videoUrl = URL.createObjectURL(recordedBlob);

      switch (platform) {
        case 'youtube': {
          window.open('https://studio.youtube.com/channel/upload', '_blank', 'noopener,noreferrer');
          toast({
            title: "YouTube Upload",
            description: "Please upload your video through YouTube Studio.",
          });
          break;
        }
        case 'twitter': {
          const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out my video!')}`;
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
          const emailSubject = encodeURIComponent('Check out my video');
          const emailBody = encodeURIComponent('I recorded this video and wanted to share it with you.');
          window.location.href = `mailto:?subject=${emailSubject}&body=${emailBody}`;
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
    <div className="space-y-2">
      {Object.entries(platformConfigs).map(([key, config]) => {
        const Icon = config.icon;
        return (
          <Button
            key={key}
            onClick={() => handleShare(key as Platform)}
            disabled={isSharing || !recordedBlob}
            variant="outline"
            className="w-full justify-start"
          >
            <Icon className="w-4 h-4 mr-2" />
            Share to {config.name}
          </Button>
        );
      })}
    </div>
  );
};