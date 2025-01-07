import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface WaveformViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onTimeUpdate?: (time: number) => void;
  isReady?: (ready: boolean) => void;
}

export const WaveformView = ({ videoRef, onTimeUpdate, isReady }: WaveformViewProps) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (!waveformRef.current || !videoRef.current) return;

    const initWaveSurfer = async () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }

      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current!,
        waveColor: '#8b5cf6',
        progressColor: '#4c1d95',
        cursorColor: '#2563eb',
        height: 80,
        normalize: true,
        interact: true,
        mediaControls: true,
        media: videoRef.current
      });

      wavesurfer.current.on('ready', () => {
        console.log('WaveSurfer is ready');
        if (isReady) {
          isReady(true);
        }
      });

      wavesurfer.current.on('timeupdate', (time: number) => {
        if (onTimeUpdate && !isNaN(time)) {
          onTimeUpdate(time);
        }
      });
    };

    initWaveSurfer();

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
    };
  }, [videoRef, onTimeUpdate, isReady]);

  return (
    <div className="relative w-full">
      <div ref={waveformRef} className="w-full rounded-lg bg-black/5" />
    </div>
  );
};