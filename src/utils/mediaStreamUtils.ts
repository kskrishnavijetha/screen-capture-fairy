import { Resolution } from '@/types/recording';
import { CaptureMode } from '@/components/CaptureModeSelector';
import { toast } from "@/components/ui/use-toast";

const getDisplayMediaConstraints = (frameRate: number, resolution: Resolution) => ({
  video: {
    frameRate: { ideal: frameRate },
    width: { ideal: resolution.width },
    height: { ideal: resolution.height }
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 44100
  }
});

const getUserMediaConstraints = (frameRate: number, resolution: Resolution) => ({
  video: {
    frameRate: { ideal: frameRate },
    width: { ideal: resolution.width },
    height: { ideal: resolution.height }
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 44100
  }
});

export const stopMediaStream = (stream: MediaStream | null) => {
  if (stream) {
    stream.getTracks().forEach(track => {
      track.stop();
    });
  }
};

export const getMediaStream = async (
  mode: CaptureMode,
  frameRate: number,
  resolution: Resolution
): Promise<MediaStream | null> => {
  try {
    switch (mode) {
      case 'screen': {
        const displayStream = await navigator.mediaDevices.getDisplayMedia(
          getDisplayMediaConstraints(frameRate, resolution)
        );
        return displayStream;
      }
      
      case 'camera': {
        const cameraStream = await navigator.mediaDevices.getUserMedia(
          getUserMediaConstraints(frameRate, resolution)
        );
        return cameraStream;
      }
      
      case 'both': {
        try {
          // Get screen capture stream
          const displayStream = await navigator.mediaDevices.getDisplayMedia(
            getDisplayMediaConstraints(frameRate, resolution)
          );
          
          // Get camera stream
          const cameraStream = await navigator.mediaDevices.getUserMedia(
            getUserMediaConstraints(frameRate, resolution)
          );
          
          // Combine all tracks from both streams
          const combinedTracks = [
            ...displayStream.getVideoTracks(),
            ...displayStream.getAudioTracks(),
            ...cameraStream.getVideoTracks(),
            ...cameraStream.getAudioTracks()
          ];
          
          return new MediaStream(combinedTracks);
        } catch (error: any) {
          console.error('Error combining streams:', error);
          toast({
            variant: "destructive",
            title: "Recording failed",
            description: error.message || "Failed to initialize both screen and camera capture"
          });
          throw error;
        }
      }
      
      default:
        throw new Error('Invalid capture mode');
    }
  } catch (error: any) {
    console.error('Media stream error:', error);
    let errorMessage = 'Failed to initialize media stream';
    
    if (error.name === 'NotAllowedError') {
      errorMessage = 'Please grant permission to access your camera and microphone';
    } else if (error.name === 'NotFoundError') {
      errorMessage = 'No camera or microphone found';
    } else if (error.name === 'NotReadableError') {
      errorMessage = 'Your camera or microphone is already in use';
    }
    
    toast({
      variant: "destructive",
      title: "Recording failed",
      description: errorMessage
    });
    
    throw error;
  }
};