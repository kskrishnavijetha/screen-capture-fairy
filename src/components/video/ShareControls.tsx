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
  clientId: string;
  scope: string;
  redirectUri: string;
}

const platformConfigs: Record<Platform, PlatformConfig> = {
  youtube: {
    name: 'YouTube',
    icon: <Youtube className="w-4 h-4 mr-2" />,
    description: 'Share your video directly to YouTube',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    clientId: process.env.YOUTUBE_CLIENT_ID || '',
    scope: 'https://www.googleapis.com/auth/youtube.upload',
    redirectUri: `${window.location.origin}/auth/youtube/callback`
  },
  vimeo: {
    name: 'Vimeo',
    icon: <Video className="w-4 h-4 mr-2" />,
    description: 'Upload your video to Vimeo',
    authUrl: 'https://api.vimeo.com/oauth/authorize',
    clientId: process.env.VIMEO_CLIENT_ID || '',
    scope: 'upload',
    redirectUri: `${window.location.origin}/auth/vimeo/callback`
  },
  twitter: {
    name: 'Twitter',
    icon: <Twitter className="w-4 h-4 mr-2" />,
    description: 'Share your video on Twitter',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    clientId: process.env.TWITTER_CLIENT_ID || '',
    scope: 'tweet.write tweet.read users.read',
    redirectUri: `${window.location.origin}/auth/twitter/callback`
  }
};

export const ShareControls = ({ recordedBlob }: ShareControlsProps) => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('youtube');
  const [isSharing, setIsSharing] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleAuthenticate = (platform: Platform) => {
    const config = platformConfigs[platform];
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: config.scope,
      state: Math.random().toString(36).substring(7)
    });

    const authWindow = window.open(
      `${config.authUrl}?${params.toString()}`,
      'Auth Window',
      'width=600,height=600'
    );

    if (authWindow) {
      const checkAuth = setInterval(() => {
        try {
          if (authWindow.closed) {
            clearInterval(checkAuth);
            handleAuthCallback();
          }
        } catch (e) {
          clearInterval(checkAuth);
        }
      }, 500);
    }
  };

  const handleAuthCallback = async () => {
    // This would be handled by your backend
    toast({
      title: "Authentication Required",
      description: `Please set up your ${platformConfigs[selectedPlatform].name} API credentials to enable sharing.`,
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
            <Button 
              onClick={() => handleAuthenticate(selectedPlatform)} 
              className="w-full"
            >
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