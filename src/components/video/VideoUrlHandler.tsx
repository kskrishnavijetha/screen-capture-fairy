import { toast } from "@/hooks/use-toast";

export const validateVideoUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    // Remove any trailing colons from hostname
    parsedUrl.hostname = parsedUrl.hostname.replace(/:$/, '');
    return parsedUrl.toString();
  } catch (error) {
    console.error('Invalid URL:', error);
    toast({
      title: "URL Error",
      description: "Invalid video URL format",
      variant: "destructive",
    });
    return '';
  }
};

export const createVideoUrl = (blob: Blob): string => {
  try {
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error creating video URL:', error);
    toast({
      title: "Error",
      description: "Failed to create video URL",
      variant: "destructive",
    });
    return '';
  }
};

export const cleanupVideoUrl = (url: string) => {
  try {
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error cleaning up video URL:', error);
  }
};