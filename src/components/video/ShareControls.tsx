import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Share2, Loader2 } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface ShareControlsProps {
  recordedBlob: Blob | null;
}

export const ShareControls = ({ recordedBlob }: ShareControlsProps) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (!recordedBlob) {
      toast({
        variant: "destructive",
        title: "Share failed",
        description: "No video available to share. Please record or process a video first.",
      });
      return;
    }

    setIsSharing(true);

    try {
      // Create a File object from the Blob
      const videoFile = new File([recordedBlob], 'recorded-video.webm', {
        type: recordedBlob.type,
        lastModified: Date.now(),
      });

      switch (selectedPlatform) {
        case 'youtube': {
          try {
            if (navigator.share && navigator.canShare({ files: [videoFile] })) {
              await navigator.share({
                files: [videoFile],
                title: 'My Recorded Video',
                text: 'Check out this video I recorded!'
              });
              toast({
                title: "Share successful",
                description: "Your video has been shared successfully.",
              });
            } else {
              // Fallback to YouTube Studio
              const youtubeUploadUrl = 'https://studio.youtube.com/channel/upload';
              const newWindow = window.open(youtubeUploadUrl, '_blank');
              
              if (newWindow) {
                toast({
                  title: "YouTube Upload",
                  description: "Please upload your video through YouTube Studio.",
                });
              } else {
                throw new Error('Popup blocked. Please allow popups and try again.');
              }
            }
          } catch (error) {
            throw new Error('Failed to share to YouTube. Please try again.');
          }
          break;
        }
        case 'facebook': {
          const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
          window.open(facebookShareUrl, '_blank', 'width=600,height=400');
          break;
        }
        case 'twitter': {
          const tweetText = 'Check out my video!';
          const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(window.location.href)}`;
          window.open(twitterShareUrl, '_blank', 'width=600,height=400');
          break;
        }
        case 'linkedin': {
          const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
          window.open(linkedinShareUrl, '_blank', 'width=600,height=400');
          break;
        }
        default:
          toast({
            variant: "destructive",
            title: "Share failed",
            description: "Please select a platform to share to.",
          });
          break;
      }
    } catch (error) {
      console.error('Share error:', error);
      toast({
        variant: "destructive",
        title: "Share failed",
        description: error instanceof Error ? error.message : "There was an error sharing your video. Please try again.",
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Select
        value={selectedPlatform}
        onValueChange={setSelectedPlatform}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select platform to share" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="youtube">YouTube</SelectItem>
          <SelectItem value="facebook">Facebook</SelectItem>
          <SelectItem value="twitter">Twitter</SelectItem>
          <SelectItem value="linkedin">LinkedIn</SelectItem>
        </SelectContent>
      </Select>

      <Button
        onClick={handleShare}
        disabled={isSharing || !selectedPlatform}
        className="w-full"
        variant="outline"
      >
        {isSharing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sharing...
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4 mr-2" />
            Share Recording
          </>
        )}
      </Button>
    </div>
  );
};