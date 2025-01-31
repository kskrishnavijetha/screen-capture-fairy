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
    sampleRate: 44100,
    autoGainControl: true
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
    sampleRate: 44100,
    autoGainControl: true
  }
});

export const stopMediaStream = (stream: MediaStream | null) => {
  if (stream) {
    stream.getTracks().forEach(track => {
      try {
        track.stop();
      } catch (error) {
        console.error('Error stopping track:', error);
      }
    });
  }
};

export const getMediaStream = async (
  mode: CaptureMode,
  frameRate: number,
  resolution: Resolution
): Promise<MediaStream | null> => {
  try {
    let combinedStream: MediaStream;
    console.log('Getting media stream for mode:', mode);

    switch (mode) {
      case 'screen': {
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
          getUserMediaConstraints(frameRate, resolution)
        );
        break;
      }
      
      case 'both': {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          ...getDisplayMediaConstraints(frameRate, resolution),
          audio: true
        });
        
        const cameraStream = await navigator.mediaDevices.getUserMedia(
          getUserMediaConstraints(frameRate, resolution)
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
      console.warn('No audio tracks found in stream');
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
    }
    
    toast({
      variant: "destructive",
      title: "Recording failed",
      description: errorMessage
    });
    
    throw error;
  }
};