export const getMediaStream = async (
  captureMode: 'screen' | 'camera' | 'both',
  frameRate: number,
  resolution: { width: number; height: number }
) => {
  const videoConstraints = { 
    frameRate,
    width: { ideal: resolution.width },
    height: { ideal: resolution.height }
  };
  
  const audioConstraints = {
    echoCancellation: true,
    noiseSuppression: true,
  };

  try {
    switch (captureMode) {
      case 'screen':
        return await navigator.mediaDevices.getDisplayMedia({
          video: videoConstraints,
          audio: audioConstraints
        });
      case 'camera':
        return await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: audioConstraints
        });
      case 'both':
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: videoConstraints,
          audio: audioConstraints
        });
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: audioConstraints
        });
        return new MediaStream([...screenStream.getTracks(), ...cameraStream.getTracks()]);
      default:
        throw new Error('Invalid capture mode');
    }
  } catch (error) {
    console.error('Error getting media stream:', error);
    throw error;
  }
};

export const stopMediaStream = (stream: MediaStream | null) => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
};