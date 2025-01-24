import { Resolution } from '@/types/recording';
import { CaptureMode } from '@/components/CaptureModeSelector';
import { toast } from "@/hooks/use-toast";

const getDisplayMediaConstraints = (frameRate: number, resolution: Resolution) => ({
  video: {
    frameRate: { ideal: frameRate },
    width: { ideal: resolution.width },
    height: { ideal: resolution.height }
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 44100,
    autoGainControl: true
  }
});

const getUserMediaConstraints = (frameRate: number, resolution: Resolution, isMobile: boolean) => ({
  video: {
    frameRate: { ideal: frameRate },
    width: { ideal: isMobile ? 640 : resolution.width },
    height: { ideal: isMobile ? 480 : resolution.height },
    facingMode: isMobile ? "user" : undefined,
    aspectRatio: isMobile ? 1.777777778 : undefined // 16:9 aspect ratio
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 44100,
    autoGainControl: true
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
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    let combinedStream: MediaStream;

    switch (mode) {
      case 'screen': {
        if (isMobile) {
          toast({
            variant: "destructive",
            title: "Screen recording unavailable",
            description: "Screen recording is not supported on mobile devices. Please use camera mode instead."
          });
          throw new Error('Screen recording is not supported on mobile devices');
        }

        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          ...getDisplayMediaConstraints(frameRate, resolution),
          audio: true
        });
        
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 44100,
              autoGainControl: true
            },
            video: false
          });
          
          combinedStream = new MediaStream([
            ...displayStream.getVideoTracks(),
            ...displayStream.getAudioTracks(),
            ...audioStream.getAudioTracks()
          ]);
        } catch (audioError) {
          console.warn('Microphone access denied, continuing with screen audio only:', audioError);
          combinedStream = displayStream;
        }
        break;
      }
      
      case 'camera': {
        combinedStream = await navigator.mediaDevices.getUserMedia(
          getUserMediaConstraints(frameRate, resolution, isMobile)
        );
        break;
      }
      
      case 'both': {
        if (isMobile) {
          toast({
            variant: "destructive",
            title: "Combined mode unavailable",
            description: "Combined screen and camera recording is not supported on mobile devices. Please use camera mode instead."
          });
          throw new Error('Combined mode is not supported on mobile devices');
        }

        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          ...getDisplayMediaConstraints(frameRate, resolution),
          audio: true
        });
        
        const cameraStream = await navigator.mediaDevices.getUserMedia(
          getUserMediaConstraints(frameRate, resolution, isMobile)
        );
        
        combinedStream = new MediaStream([
          ...displayStream.getVideoTracks(),
          ...displayStream.getAudioTracks(),
          ...cameraStream.getVideoTracks(),
          ...cameraStream.getAudioTracks()
        ]);
        break;
      }
      
      default:
        throw new Error('Invalid capture mode');
    }

    if (combinedStream.getAudioTracks().length === 0) {
      toast({
        variant: "default",
        title: "No audio detected",
        description: "Make sure you've granted permission for audio capture"
      });
    }

    return combinedStream;
  } catch (error: any) {
    console.error('Media stream error:', error);
    let errorMessage = 'Failed to initialize media stream';
    
    if (error.name === 'NotAllowedError') {
      errorMessage = 'Please grant permission to access your camera and microphone';
    } else if (error.name === 'NotFoundError') {
      errorMessage = 'No camera or microphone found';
    } else if (error.name === 'NotReadableError') {
      errorMessage = 'Your camera or microphone is already in use';
    } else if (error.name === 'OverconstrainedError') {
      errorMessage = 'The requested media settings are not supported by your device';
    } else if (error.name === 'AbortError') {
      errorMessage = 'Media capture was aborted';
    }
    
    toast({
      variant: "destructive",
      title: "Recording failed",
      description: errorMessage
    });
    
    throw error;
  }
};