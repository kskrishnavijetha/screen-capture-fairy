import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface WaveformViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onTimeUpdate?: (time: number) => void;
}

export const WaveformView = ({ videoRef, onTimeUpdate }: WaveformViewProps) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (!waveformRef.current || !videoRef.current) return;

    const initWaveSurfer = async () => {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current!,
        waveColor: '#8b5cf6',
        progressColor: '#4c1d95',
        cursorColor: '#2563eb',
        height: 80,
        normalize: true,
        interact: true,
        mediaControls: true,
      });

      wavesurfer.current.on('ready', () => {
        console.log('WaveSurfer is ready');
      });

      wavesurfer.current.on('timeupdate', (time: number) => {
        if (onTimeUpdate) {
          onTimeUpdate(time);
        }
      });

      try {
        // Create a URL from the video source
        const videoUrl = videoRef.current.src;
        wavesurfer.current.load(videoUrl);
      } catch (error) {
        console.error('Error loading media:', error);
      }
    };

    initWaveSurfer();

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
    };
  }, [videoRef, onTimeUpdate]);

  return (
    <div className="relative w-full">
      <div ref={waveformRef} className="w-full rounded-lg bg-black/5" />
    </div>
  );
};