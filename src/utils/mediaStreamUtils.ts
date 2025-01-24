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
          video: true,
          audio: true
        });

        try {
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: constraints.audio,
            video: false
          });
          
          const tracks = [
            ...displayStream.getVideoTracks(),
            ...displayStream.getAudioTracks(),
            ...micStream.getAudioTracks()
          ];
          
          return new MediaStream(tracks);
        } catch (audioError) {
          console.warn('Could not capture microphone audio:', audioError);
          return displayStream;
        }
      } catch (error: any) {
        console.error('Screen capture error:', error);
        throw new Error(
          error.name === 'NotAllowedError' 
            ? 'Please grant screen sharing permission and try again'
            : 'Failed to access screen recording. Please try again'
        );
      }
    } else if (mode === 'camera') {
      try {
        return await navigator.mediaDevices.getUserMedia({
          video: constraints.video,
          audio: constraints.audio
        });
      } catch (error: any) {
        console.error('Camera access error:', error);
        throw new Error(
          error.name === 'NotAllowedError'
            ? 'Please grant camera and microphone permissions'
            : 'Failed to access camera. Please check your device settings'
        );
      }
    }
    throw new Error('Invalid capture mode');
  } catch (error) {
    console.error('Media stream error:', error);
    throw error;
  }
};

export const stopMediaStream = (stream: MediaStream | null) => {
  if (stream) {
    stream.getTracks().forEach(track => {
      track.stop();
    });
  }
};