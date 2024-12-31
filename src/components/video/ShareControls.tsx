import React from 'react';
import { Button } from "@/components/ui/button";
import { Youtube, Video, Share2 } from 'lucide-react';
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
  const [selectedPlatform, setSelectedPlatform] = React.useState<Platform>('youtube');
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
      // Since we don't have actual API integration yet, show a toast message
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