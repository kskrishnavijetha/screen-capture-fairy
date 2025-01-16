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

export const getMediaStream = async (
  mode: CaptureMode,
  frameRate: number,
  resolution: Resolution
): Promise<MediaStream | null> => {
  try {
    const constraints = getSupportedConstraints(frameRate, resolution);

    if (mode === 'screen') {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          ...constraints,
          audio: {
            ...constraints.audio,
            displaySurface: 'monitor'
          }
        });

        // Get system audio if available
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: constraints.audio,
            video: false
          });
          
          // Combine display and audio streams
          const tracks = [
            ...displayStream.getVideoTracks(),
            ...audioStream.getAudioTracks()
          ];
          return new MediaStream(tracks);
        } catch (audioError) {
          console.warn('Could not capture system audio:', audioError);
          return displayStream;
        }
      } catch (error) {
        console.error('Screen capture error:', error);
        toast({
          variant: "destructive",
          title: "Screen Recording Failed",
          description: "Please grant screen recording and audio permissions and try again."
        });
        return null;
      }
    } else if (mode === 'camera') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
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
    } else if (mode === 'both') {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          ...constraints,
          audio: {
            ...constraints.audio,
            displaySurface: 'monitor'
          }
        });
        
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: constraints.video,
          audio: constraints.audio
        });

        // Combine all tracks
        const tracks = [
          ...displayStream.getVideoTracks(),
          ...displayStream.getAudioTracks(),
          ...cameraStream.getVideoTracks(),
          ...cameraStream.getAudioTracks()
        ];
        
        return new MediaStream(tracks);
      } catch (error) {
        console.error('Media capture error:', error);
        toast({
          variant: "destructive",
          title: "Recording Failed",
          description: "Please grant all necessary permissions and try again."
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
    });
  }
};