import { useRef } from 'react';

export const useRecordingState = () => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  return {
    mediaRecorderRef,
    chunksRef,
    streamRef
  };
};