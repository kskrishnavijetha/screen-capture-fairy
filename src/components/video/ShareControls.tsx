import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Share2 } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { LinkShareControls } from './LinkShareControls';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Platform, platformConfigs } from './sharing/platformConfigs';

interface ShareControlsProps {
  recordedBlob: Blob | null;
}

export const ShareControls = ({ recordedBlob }: ShareControlsProps) => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('email');
  const [isSharing, setIsSharing] = useState(false);

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
      // Create a temporary URL for the video blob
      const videoUrl = URL.createObjectURL(recordedBlob);

      // Create a File from the Blob for sharing
      const videoFile = new File([recordedBlob], 'recorded-video.webm', { type: recordedBlob.type });

      switch (selectedPlatform) {
        case 'email': {
          if (navigator.share) {
            await navigator.share({
              files: [videoFile],
              title: 'Check out my video',
              text: 'I recorded this video and wanted to share it with you.'
            });
          } else {
            const emailSubject = encodeURIComponent('Check out my video');
            const emailBody = encodeURIComponent('I recorded this video and wanted to share it with you.');
            window.location.href = `mailto:?subject=${emailSubject}&body=${emailBody}`;
            // Attach the video file to the email if supported
            if (videoFile) {
              const dataTransfer = new DataTransfer();
              dataTransfer.items.add(videoFile);
              const input = document.createElement('input');
              input.type = 'file';
              input.files = dataTransfer.files;
              input.click();
            }
          }
          break;
        }

        case 'facebook': {
          const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
          window.open(shareUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
          break;
        }
        
        case 'twitter': {
          const tweetText = encodeURIComponent('Check out my video!');
          const shareUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(window.location.href)}`;
          window.open(shareUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
          break;
        }

        case 'linkedin': {
          const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
          window.open(shareUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
          break;
        }

        default:
          toast({
            variant: "destructive",
            title: "Platform not supported",
            description: "This sharing platform is not yet supported.",
          });
          break;
      }

      toast({
        title: "Share initiated",
        description: `Sharing to ${platformConfigs[selectedPlatform].name} has been initiated.`,
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
            {Object.entries(platformConfigs).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center">
                    <Icon className="w-4 h-4 mr-2" />
                    {config.name}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
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
            Share to {platformConfigs[selectedPlatform].name}
          </>
        )}
      </Button>

      <LinkShareControls recordedBlob={recordedBlob} />
    </div>
  );
};