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
    
    // Show API key setup instructions
    toast({
      title: "Authentication Required",
      description: `Please set up your ${platform.name} API credentials in the project settings to enable sharing.`,
    });

    // Here you would typically trigger the API key setup flow
    setShowAuthDialog(false);
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
            {Object.entries(platformConfigs).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center">
                  {React.createElement(config.icon, { className: "w-4 h-4 mr-2" })}
                  {config.name}
                </div>
              </SelectItem>
            ))}
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