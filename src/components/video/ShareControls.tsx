import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Youtube, Video, Share2, Twitter } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { LinkShareControls } from './LinkShareControls';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Platform = 'youtube' | 'vimeo' | 'twitter';

interface ShareControlsProps {
  recordedBlob: Blob | null;
}

interface PlatformConfig {
  name: string;
  icon: React.ReactNode;
  description: string;
  authUrl: string;
}

const platformConfigs: Record<Platform, PlatformConfig> = {
  youtube: {
    name: 'YouTube',
    icon: <Youtube className="w-4 h-4 mr-2" />,
    description: 'Share your video directly to YouTube',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth'
  },
  vimeo: {
    name: 'Vimeo',
    icon: <Video className="w-4 h-4 mr-2" />,
    description: 'Upload your video to Vimeo',
    authUrl: 'https://api.vimeo.com/oauth/authorize'
  },
  twitter: {
    name: 'Twitter',
    icon: <Twitter className="w-4 h-4 mr-2" />,
    description: 'Share your video on Twitter',
    authUrl: 'https://twitter.com/i/oauth2/authorize'
  }
};

export const ShareControls = ({ recordedBlob }: ShareControlsProps) => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('youtube');
  const [isSharing, setIsSharing] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

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
      // Show authentication dialog
      setShowAuthDialog(true);
      
      toast({
        title: "API Integration Required",
        description: `To enable sharing to ${platformConfigs[selectedPlatform].name}, please authenticate with your account.`,
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

  const handleAuthenticate = () => {
    // Open OAuth window
    const width = 600;
    const height = 600;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;
    
    window.open(
      platformConfigs[selectedPlatform].authUrl,
      'Auth Window',
      `width=${width},height=${height},left=${left},top=${top}`
    );
    
    setShowAuthDialog(false);
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
                  {config.icon}
                  {config.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <LinkShareControls recordedBlob={recordedBlob} />

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share to {platformConfigs[selectedPlatform].name}</DialogTitle>
            <DialogDescription>
              {platformConfigs[selectedPlatform].description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter video title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter video description"
              />
            </div>
            <Button onClick={handleAuthenticate} className="w-full">
              Authenticate with {platformConfigs[selectedPlatform].name}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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