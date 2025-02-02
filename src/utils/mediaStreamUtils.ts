import { Resolution } from '@/types/recording';
import { CaptureMode } from '@/components/CaptureModeSelector';
import { toast } from "@/components/ui/use-toast";

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
    let combinedStream: MediaStream;
    const audioConstraints = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 44100
    };

    switch (mode) {
      case 'screen': {
        // Get screen capture with system audio
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            frameRate: { ideal: frameRate },
            width: { ideal: resolution.width },
            height: { ideal: resolution.height }
          },
          audio: true // Enable system audio capture
        });
        
        try {
          // Always try to get microphone audio
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: audioConstraints,
            video: false
          });
          
          // Combine all tracks
          combinedStream = new MediaStream([
            ...displayStream.getVideoTracks(),
            ...displayStream.getAudioTracks(),
            ...micStream.getAudioTracks()
          ]);
        } catch (audioError) {
          console.warn('Microphone access denied:', audioError);
          // Fall back to just screen capture with system audio
          combinedStream = displayStream;
        }
        break;
      }
      
      case 'camera': {
        // For camera mode, capture both video and audio
        combinedStream = await navigator.mediaDevices.getUserMedia({
          video: {
            frameRate: { ideal: frameRate },
            width: { ideal: resolution.width },
            height: { ideal: resolution.height }
          },
          audio: audioConstraints
        });
        break;
      }
      
      case 'both': {
        // Get screen capture with system audio
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            frameRate: { ideal: frameRate },
            width: { ideal: resolution.width },
            height: { ideal: resolution.height }
          },
          audio: true
        });
        
        // Get camera and microphone
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: audioConstraints
        });
        
        // Combine all tracks
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

    // Verify audio tracks
    if (combinedStream.getAudioTracks().length === 0) {
      toast({
        title: "Audio Warning",
        description: "No audio source detected. Please check your microphone settings.",
        variant: "destructive"
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
      title: "Recording Error",
      description: errorMessage,
      variant: "destructive"
    });
    
    return null;
  }
};