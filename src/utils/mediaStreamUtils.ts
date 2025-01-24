import { Resolution } from '@/types/recording';
import { CaptureMode } from '@/components/CaptureModeSelector';
import { toast } from "@/hooks/use-toast";

const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const getSupportedConstraints = (frameRate: number, resolution: Resolution) => {
  const baseConstraints = {
    video: {
      width: { ideal: resolution.width },
      height: { ideal: resolution.height },
      frameRate: { ideal: frameRate }
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 44100,
      autoGainControl: true
    }
  };

  if (isMobileDevice()) {
    return {
      ...baseConstraints,
      video: {
        ...baseConstraints.video,
        width: { ideal: Math.min(resolution.width, 1280) },
        height: { ideal: Math.min(resolution.height, 720) },
        frameRate: { ideal: Math.min(frameRate, 30) }
      }
    };
  }

  return baseConstraints;
};

const checkMediaPermissions = async () => {
  try {
    const permissions = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    permissions.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error('Permission check failed:', error);
    return false;
  }
};

export const getMediaStream = async (
  mode: CaptureMode,
  frameRate: number,
  resolution: Resolution
): Promise<MediaStream | null> => {
  try {
    // First check if we have the required permissions
    const hasPermissions = await checkMediaPermissions();
    if (!hasPermissions) {
      toast({
        variant: "destructive",
        title: "Permission Required",
        description: "Please grant access to your camera and microphone to start recording."
      });
      return null;
    }

    const constraints = getSupportedConstraints(frameRate, resolution);

    if (mode === 'screen') {
      try {
        // First try to get display media
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: constraints.video,
          audio: true
        });

        // Then try to get microphone audio
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: constraints.audio,
            video: false
          });
          
          // Combine all tracks
          const tracks = [
            ...displayStream.getVideoTracks(),
            ...displayStream.getAudioTracks(),
            ...micStream.getAudioTracks()
          ];
          
          return new MediaStream(tracks);
        } catch (audioError) {
          console.warn('Could not capture microphone audio:', audioError);
          // Return display stream even if mic access fails
          return displayStream;
        }
      } catch (error: any) {
        console.error('Screen capture error:', error);
        
        let errorMessage = "Failed to start screen recording. ";
        if (error.name === 'NotAllowedError') {
          errorMessage += "Please grant screen sharing permission and try again.";
        } else if (error.name === 'NotReadableError') {
          errorMessage += "Could not access your screen. Please check your display settings.";
        } else {
          errorMessage += "Please check your permissions and try again.";
        }
        
        toast({
          variant: "destructive",
          title: "Screen Recording Failed",
          description: errorMessage
        });
        return null;
      }
    } else if (mode === 'camera') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: constraints.video,
          audio: constraints.audio
        });
        return stream;
      } catch (error: any) {
        console.error('Camera access error:', error);
        
        let errorMessage = "Failed to access camera. ";
        if (error.name === 'NotAllowedError') {
          errorMessage += "Please grant camera and microphone permissions.";
        } else if (error.name === 'NotFoundError') {
          errorMessage += "No camera or microphone found.";
        } else if (error.name === 'NotReadableError') {
          errorMessage += "Your camera or microphone is already in use.";
        } else {
          errorMessage += "Please check your device settings and try again.";
        }
        
        toast({
          variant: "destructive",
          title: "Camera Access Failed",
          description: errorMessage
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
      description: "Failed to initialize media devices. Please check your permissions and try again."
    });
    return null;
  }
};

export const stopMediaStream = (stream: MediaStream | null) => {
  if (stream) {
    stream.getTracks().forEach(track => {
      track.stop();
    });
  }
};