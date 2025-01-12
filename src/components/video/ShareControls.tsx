import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Share2 } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { LinkShareControls } from './LinkShareControls';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Platform, platformConfigs } from './sharing/platformConfigs';
import { AuthDialog } from './sharing/AuthDialog';

interface ShareControlsProps {
  recordedBlob: Blob | null;
}

export const ShareControls = ({ recordedBlob }: ShareControlsProps) => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('youtube');
  const [isSharing, setIsSharing] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleAuthenticate = async () => {
    const platform = platformConfigs[selectedPlatform];
    
    toast({
      title: "Authentication Required",
      description: `Please set up your ${platform.name} API credentials in the project settings to enable sharing.`,
    });

    setShowAuthDialog(false);
  };

  const createShareableVideoUrl = async (blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        const videoData = encodeURIComponent(base64Data);
        const shareableUrl = `${window.location.origin}/playback?video=${videoData}`;
        resolve(shareableUrl);
      };
      reader.readAsDataURL(blob);
    });
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
      const shareableUrl = await createShareableVideoUrl(recordedBlob);
      
      if (selectedPlatform === 'email') {
        const emailSubject = encodeURIComponent('Check out this video');
        const emailBody = encodeURIComponent(`I wanted to share this video with you.\n\nView the video here: ${shareableUrl}`);
        window.location.href = `mailto:?subject=${emailSubject}&body=${emailBody}`;
        return;
      }

      if (selectedPlatform === 'gmail') {
        const emailSubject = encodeURIComponent('Check out this video');
        const emailBody = encodeURIComponent(`I wanted to share this video with you.\n\nView the video here: ${shareableUrl}`);
        window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${emailSubject}&body=${emailBody}`, '_blank');
        return;
      }

      if (selectedPlatform === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableUrl)}`, '_blank', 'width=600,height=400');
        return;
      }
      
      if (selectedPlatform === 'instagram') {
        toast({
          title: "Instagram Sharing",
          description: "To share on Instagram, download the video and upload it through the Instagram app or website.",
        });
        return;
      }

      if (selectedPlatform === 'linkedin') {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableUrl)}`, '_blank', 'width=600,height=400');
        return;
      }

      setShowAuthDialog(true);
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

      <LinkShareControls recordedBlob={recordedBlob} />

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        selectedPlatform={selectedPlatform}
        title={title}
        description={description}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onAuthenticate={handleAuthenticate}
      />

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
    </div>
  );
};