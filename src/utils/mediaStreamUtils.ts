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
      sampleRate: 44100
    }
  };

  if (isMobileDevice()) {
    // Adjust constraints for mobile devices
    return {
      ...baseConstraints,
      video: {
        ...baseConstraints.video,
        width: { ideal: Math.min(resolution.width, 1280) }, // Lower resolution for mobile
        height: { ideal: Math.min(resolution.height, 720) },
        frameRate: { ideal: Math.min(frameRate, 30) } // Lower framerate for mobile
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
        // For desktop browsers
        if (!isMobileDevice() && navigator.mediaDevices.getDisplayMedia) {
          const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
          return stream;
        } 
        // For mobile browsers that support screen sharing
        else if (navigator.mediaDevices.getDisplayMedia) {
          const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
          return stream;
        } else {
          throw new Error('Screen recording is not supported on this device/browser');
        }
      } catch (error) {
        console.error('Screen capture error:', error);
        toast({
          variant: "destructive",
          title: "Screen Recording Failed",
          description: "Please grant screen recording permissions and try again. Note: Some mobile browsers may not support screen recording."
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
        let screenStream;
        if (navigator.mediaDevices.getDisplayMedia) {
          screenStream = await navigator.mediaDevices.getDisplayMedia(constraints);
        } else {
          throw new Error('Screen recording is not supported on this device/browser');
        }
        
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          ...constraints,
          audio: false // We don't need audio from camera when capturing both
        });

        // Combine the tracks from both streams
        const combinedStream = new MediaStream();
        screenStream.getTracks().forEach(track => combinedStream.addTrack(track));
        cameraStream.getTracks().forEach(track => combinedStream.addTrack(track));
        
        return combinedStream;
      } catch (error) {
        console.error('Media capture error:', error);
        toast({
          variant: "destructive",
          title: "Recording Failed",
          description: isMobileDevice() 
            ? "Combined screen and camera recording might not be supported on your mobile device."
            : "Please grant all necessary permissions and try again."
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