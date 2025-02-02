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
      sampleRate: 48000,
      channelCount: 2
    };

    const videoConstraints = {
      frameRate: { ideal: frameRate },
      width: { ideal: resolution.width },
      height: { ideal: resolution.height }
    };

    switch (mode) {
      case 'screen': {
        // Get screen capture with system audio
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: videoConstraints,
          audio: true // Simplified audio constraints for screen capture
        });

        // Always try to get microphone audio
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: audioConstraints,
            video: false
          });

          // Create a new stream with all tracks
          const allTracks = [
            ...displayStream.getVideoTracks(),
            ...displayStream.getAudioTracks(),
            ...micStream.getAudioTracks()
          ];

          combinedStream = new MediaStream(allTracks);
        } catch (audioError) {
          console.warn('Microphone access denied:', audioError);
          combinedStream = displayStream;
        }
        break;
      }
      
      case 'camera': {
        combinedStream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: audioConstraints
        });
        break;
      }
      
      case 'both': {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: videoConstraints,
          audio: true // Simplified audio constraints for screen capture
        });
        
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: audioConstraints
        });
        
        const allTracks = [
          ...displayStream.getVideoTracks(),
          ...displayStream.getAudioTracks(),
          ...cameraStream.getVideoTracks(),
          ...cameraStream.getAudioTracks()
        ];

        combinedStream = new MediaStream(allTracks);
        break;
      }
      
      default:
        throw new Error('Invalid capture mode');
    }

    // Verify audio tracks
    if (combinedStream.getAudioTracks().length === 0) {
      toast({
        title: "Audio Warning",
        description: "No audio source detected. Please check your microphone and system audio settings.",
        variant: "destructive"
      });
    }

    return combinedStream;
  } catch (error: any) {
    console.error('Media stream error:', error);
    let errorMessage = 'Failed to initialize media stream';
    
    if (error.name === 'NotAllowedError') {
      errorMessage = 'Please grant permission to access your microphone and system audio';
    } else if (error.name === 'NotFoundError') {
      errorMessage = 'No audio devices found';
    } else if (error.name === 'NotReadableError') {
      errorMessage = 'Your audio device is already in use';
    }
    
    toast({
      title: "Recording Error",
      description: errorMessage,
      variant: "destructive"
    });
    
    return null;
  }
};