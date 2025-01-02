import { Resolution } from '@/types/recording';
import { CaptureMode } from '@/components/CaptureModeSelector';
import { toast } from "@/hooks/use-toast";

export const getMediaStream = async (
  mode: CaptureMode,
  frameRate: number,
  resolution: Resolution
): Promise<MediaStream | null> => {
  try {
    const videoConstraints: MediaTrackConstraints = {
      width: { ideal: resolution.width },
      height: { ideal: resolution.height },
      frameRate: { ideal: frameRate }
    };

    if (mode === 'screen') {
      // For screen capture, we need to use getDisplayMedia with specific options
      return await navigator.mediaDevices.getDisplayMedia({
        video: videoConstraints,
        audio: true
      });
    } else if (mode === 'camera') {
      // For camera capture, we use getUserMedia
      return await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: true
      });
    }
    return null;
  } catch (error) {
    console.error('Error getting media stream:', error);
    toast({
      variant: "destructive",
      title: "Stream error",
      description: "Failed to access media device. Please check permissions."
    });
    return null;
  }
};

export const stopMediaStream = (stream: MediaStream | null) => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
};