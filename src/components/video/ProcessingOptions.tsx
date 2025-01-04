import React from 'react';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

interface ProcessingOptionsProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  timestamps: Array<{ time: number; label: string }>;
  isMetadataLoaded: boolean;
  isProcessing: boolean;
  onSave: (blob: Blob) => void;
  processVideo: (options: any) => Promise<Blob>;
}

export const ProcessingOptions = ({
  videoRef,
  timestamps,
  isMetadataLoaded,
  isProcessing,
  onSave,
  processVideo
}: ProcessingOptionsProps) => {
  const handleProcess = async () => {
    if (!videoRef.current || !isMetadataLoaded) return;

    try {
      const processedBlob = await processVideo({
        videoRef,
        timestamps,
        trimRange: [0, 100],
        duration: videoRef.current.duration,
        transitionType: 'none',
        blurRegions: [],
        captions: [],
        annotations: [],
        watermark: null
      });
      
      onSave(processedBlob);
    } catch (error) {
      console.error('Processing error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleProcess}
        disabled={!isMetadataLoaded || isProcessing}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Process Video'
        )}
      </Button>
    </div>
  );
};