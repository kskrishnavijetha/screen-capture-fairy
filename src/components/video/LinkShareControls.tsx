import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link2, Copy, Check, Mail, Youtube, Facebook, Linkedin, Twitter } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface LinkShareControlsProps {
  recordedBlob: Blob | null;
}

export const LinkShareControls = ({ recordedBlob }: LinkShareControlsProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const [shareableLink, setShareableLink] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateShareableLink = async () => {
    if (!recordedBlob) {
      toast({
        variant: "destructive",
        title: "No video to share",
        description: "Please record or process a video first.",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Generate a unique file name
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webm`;
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('secure_files')
        .upload(fileName, recordedBlob, {
          contentType: 'video/webm',
          cacheControl: '3600',
        });

      if (error) throw error;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('secure_files')
        .getPublicUrl(fileName);

      setShareableLink(publicUrl);
      toast({
        title: "Link Generated",
        description: "Shareable link has been generated successfully.",
      });
    } catch (error) {
      console.error('Error generating link:', error);
      toast({
        variant: "destructive",
        title: "Error generating link",
        description: "Failed to generate shareable link.",
      });
    } finally {
      setIsGenerating(false);
    }
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
      console.error('Error copying to clipboard:', error);
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Failed to copy link to clipboard.",
      });
    }
  };

  const shareToSocialMedia = (platform: string) => {
    if (!shareableLink) {
      toast({
        variant: "destructive",
        title: "No link to share",
        description: "Please generate a shareable link first.",
      });
      return;
    }

    const videoTitle = "Check out my video!";
    const videoDescription = "I recorded this video and wanted to share it with you.";

    const shareUrls = {
      youtube: 'https://studio.youtube.com/channel/upload',
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(videoDescription)}&url=${encodeURIComponent(shareableLink)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableLink)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableLink)}`,
      email: `mailto:?subject=${encodeURIComponent(videoTitle)}&body=${encodeURIComponent(
        `${videoDescription}\n\nView it here: ${shareableLink}`
      )}`,
    };

    const url = shareUrls[platform as keyof typeof shareUrls];
    
    if (platform === 'email') {
      window.location.href = url;
    } else {
      window.open(url, '_blank', 'width=550,height=420');
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={generateShareableLink}
        disabled={!recordedBlob || isGenerating}
        variant="outline"
        className="w-full justify-start bg-background hover:bg-accent gap-2"
      >
        <Link2 className="w-4 h-4" />
        {isGenerating ? "Generating Link..." : "Generate Shareable Link"}
      </Button>

      {shareableLink && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={shareableLink}
              readOnly
              className="flex-1 font-mono text-sm"
            />
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              {isCopied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => shareToSocialMedia('email')}
              variant="outline"
              className="w-full justify-start bg-black hover:bg-gray-800 text-white gap-2"
            >
              <Mail className="w-4 h-4" />
              Share via Email
            </Button>
            <Button
              onClick={() => shareToSocialMedia('youtube')}
              variant="outline"
              className="w-full justify-start bg-red-600 hover:bg-red-700 text-white gap-2"
            >
              <Youtube className="w-4 h-4" />
              Share to YouTube
            </Button>
            <Button
              onClick={() => shareToSocialMedia('facebook')}
              variant="outline"
              className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <Facebook className="w-4 h-4" />
              Share to Facebook
            </Button>
            <Button
              onClick={() => shareToSocialMedia('linkedin')}
              variant="outline"
              className="w-full justify-start bg-blue-700 hover:bg-blue-800 text-white gap-2"
            >
              <Linkedin className="w-4 h-4" />
              Share to LinkedIn
            </Button>
            <Button
              onClick={() => shareToSocialMedia('twitter')}
              variant="outline"
              className="w-full justify-start bg-blue-400 hover:bg-blue-500 text-white gap-2"
            >
              <Twitter className="w-4 h-4" />
              Share to Twitter
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};