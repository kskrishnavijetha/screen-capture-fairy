export class NoiseReducer {
  private context: AudioContext;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private denoisedStream: MediaStream | null = null;

  constructor() {
    this.context = new AudioContext();
  }

  async setupNoiseCancellation(stream: MediaStream): Promise<MediaStream> {
    // Create audio nodes
    this.sourceNode = this.context.createMediaStreamSource(stream);
    this.gainNode = this.context.createGain();
    this.analyserNode = this.context.createAnalyser();

    // Configure analyser node
    this.analyserNode.fftSize = 2048;
    this.analyserNode.smoothingTimeConstant = 0.8;

    // Connect nodes
    this.sourceNode.connect(this.analyserNode);
    this.analyserNode.connect(this.gainNode);

    // Create noise gate threshold
    const bufferLength = this.analyserNode.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);

    // Dynamic noise reduction
    const processFrame = () => {
      this.analyserNode!.getFloatFrequencyData(dataArray);
      
      // Calculate average noise level
      const noiseLevel = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      
      // Adjust gain based on noise level
      if (this.gainNode) {
        // Reduce gain for high noise levels
        const threshold = -50;
        const gain = noiseLevel < threshold ? 1.0 : Math.max(0.3, 1.0 - (noiseLevel - threshold) / 100);
        this.gainNode.gain.setValueAtTime(gain, this.context.currentTime);
      }

      requestAnimationFrame(processFrame);
    };

    processFrame();

    // Create MediaStream from processed audio
    const destination = this.context.createMediaStreamDestination();
    this.gainNode.connect(destination);

    // Combine processed audio with original video
    const videoTracks = stream.getVideoTracks();
    this.denoisedStream = new MediaStream([
      ...videoTracks,
      destination.stream.getAudioTracks()[0]
    ]);

    return this.denoisedStream;
  }

  cleanup() {
    if (this.sourceNode) {
      this.sourceNode.disconnect();
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
    }
    if (this.analyserNode) {
      this.analyserNode.disconnect();
    }
    if (this.denoisedStream) {
      this.denoisedStream.getTracks().forEach(track => track.stop());
    }
  }
}