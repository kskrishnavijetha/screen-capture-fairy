import { useState, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { toast } from './use-toast';

export const useVideoProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const trimVideo = useCallback(async (
    videoBlob: Blob,
    startTime: number,
    endTime: number
  ): Promise<Blob | null> => {
    setIsProcessing(true);
    setProgress(0);

    try {
      const ffmpeg = new FFmpeg();
      
      // Load FFmpeg
      await ffmpeg.load({
        coreURL: await toBlobURL('/ffmpeg-core.js', 'text/javascript'),
        wasmURL: await toBlobURL('/ffmpeg-core.wasm', 'application/wasm'),
      });

      // Write input file
      const inputFileName = 'input.webm';
      const outputFileName = 'output.webm';
      ffmpeg.writeFile(inputFileName, await fetchFile(videoBlob));

      // Set up progress tracking
      ffmpeg.on('progress', ({ progress }) => {
        setProgress(Math.round(progress * 100));
      });

      // Execute trim command
      const duration = endTime - startTime;
      await ffmpeg.exec([
        '-i', inputFileName,
        '-ss', startTime.toString(),
        '-t', duration.toString(),
        '-c', 'copy',
        outputFileName
      ]);

      // Read the output file
      const data = await ffmpeg.readFile(outputFileName);
      const trimmedBlob = new Blob([data], { type: 'video/webm' });

      setIsProcessing(false);
      setProgress(100);
      toast({
        title: "Video trimmed successfully",
        description: "Your video has been trimmed and is ready to save.",
      });

      return trimmedBlob;
    } catch (error) {
      console.error('Error trimming video:', error);
      toast({
        title: "Error trimming video",
        description: "There was an error processing your video. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
      return null;
    }
  }, []);

  return {
    trimVideo,
    isProcessing,
    progress
  };
};