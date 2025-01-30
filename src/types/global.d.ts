interface Window {
  fabric: any;
}

interface HTMLVideoElement {
  mozHasAudio?: boolean;
  webkitAudioDecodedByteCount?: number;
  audioTracks?: {
    length: number;
  };
}