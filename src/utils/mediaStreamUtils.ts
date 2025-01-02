import { Resolution } from '@/types/recording';
import { CaptureMode } from '@/components/CaptureModeSelector';
import { toast } from "@/hooks/use-toast";

export const getMediaStream = async (
  mode: CaptureMode,
  frameRate: number,
  resolution: Resolution
): Promise<MediaStream | null> => {
  try {
    const constraints: MediaStreamConstraints = {
      audio: mode !== 'screen',
      video: {
        width: { ideal: resolution.width },
        height: { ideal: resolution.height },
        frameRate: { ideal: frameRate }
      }
    };

    if (mode === 'screen') {
      return await navigator.mediaDevices.getDisplayMedia({
        ...constraints,
        video: {
          ...constraints.video,
          displaySurface: 'monitor',
        }
      });
    } else if (mode === 'camera') {
      return await navigator.mediaDevices.getUserMedia(constraints);
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