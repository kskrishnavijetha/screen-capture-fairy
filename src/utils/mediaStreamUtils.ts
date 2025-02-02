import { Resolution } from '@/types/recording';
import { CaptureMode } from '@/components/CaptureModeSelector';
import { toast } from "@/components/ui/use-toast";

export const getMediaStream = async (
  mode: CaptureMode,
  frameRate: number,
  resolution: Resolution
): Promise<MediaStream | null> => {
  try {
    const videoConstraints = {
      frameRate: { ideal: frameRate },
      width: { ideal: resolution.width },
      height: { ideal: resolution.height }
    };

    let stream: MediaStream;

    switch (mode) {
      case 'screen': {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: videoConstraints,
          audio: true
        });
        break;
      }
      
      case 'camera': {
        stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: true
        });
        break;
      }
      
      case 'both': {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: videoConstraints,
          audio: true
        });
        
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        stream = new MediaStream([
          ...displayStream.getTracks(),
          ...cameraStream.getTracks()
        ]);
        break;
      }
      
      default:
        throw new Error('Invalid capture mode');
    }

    return stream;
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
    
    return null;
  }
};

export const stopMediaStream = (stream: MediaStream | null) => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
};