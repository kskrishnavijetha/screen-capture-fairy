import { NoiseReducer } from './noiseReduction';

export const getMediaStream = async (
  captureMode: 'screen' | 'camera' | 'both',
  frameRate: number
) => {
  const videoConstraints = { frameRate };
  const audioConstraints = {
    echoCancellation: true,
    noiseSuppression: true,
  };

  try {
    let stream: MediaStream;
    const noiseReducer = new NoiseReducer();

    switch (captureMode) {
      case 'screen':
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: videoConstraints,
          audio: audioConstraints
        });
        return await noiseReducer.setupNoiseCancellation(stream);
      
      case 'camera':
        stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: audioConstraints
        });
        return await noiseReducer.setupNoiseCancellation(stream);
      
      case 'both':
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: videoConstraints,
          audio: audioConstraints
        });
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: audioConstraints
        });
        
        // Combine streams
        const combinedStream = new MediaStream([
          ...screenStream.getTracks(),
          ...cameraStream.getTracks()
        ]);
        
        return await noiseReducer.setupNoiseCancellation(combinedStream);
      
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