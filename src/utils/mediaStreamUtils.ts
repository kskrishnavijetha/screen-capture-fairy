import { Resolution } from '@/types/recording';
import { CaptureMode } from '@/components/CaptureModeSelector';
import { toast } from "@/hooks/use-toast";

export const getMediaStream = async (
  mode: CaptureMode,
  frameRate: number,
  resolution: Resolution
): Promise<MediaStream | null> => {
  try {
    // Define video constraints
    const videoConstraints: MediaTrackConstraints = {
      width: { ideal: resolution.width },
      height: { ideal: resolution.height },
      frameRate: { ideal: frameRate }
    };

    // Check if we have the necessary permissions first
    if (mode === 'screen') {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            ...videoConstraints,
            displaySurface: 'monitor',
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          }
        });
        return stream;
      } catch (error) {
        console.error('Screen capture error:', error);
        toast({
          variant: "destructive",
          title: "Screen Recording Failed",
          description: "Please grant screen recording permissions and try again."
        });
        return null;
      }
    } else if (mode === 'camera') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          }
        });
        return stream;
      } catch (error) {
        console.error('Camera access error:', error);
        toast({
          variant: "destructive",
          title: "Camera Access Failed",
          description: "Please grant camera and microphone permissions and try again."
        });
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error('Media stream error:', error);
    toast({
      variant: "destructive",
      title: "Recording Failed",
      description: "Failed to access media devices. Please check permissions and try again."
    });
    return null;
  }
};

export const stopMediaStream = (stream: MediaStream | null) => {
  if (stream) {
    stream.getTracks().forEach(track => {
      track.stop();
      stream.removeTrack(track);
    });
  }
};