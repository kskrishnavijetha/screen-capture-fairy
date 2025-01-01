import React from 'react';
import { VideoEditor } from '../VideoEditor';
import { toast } from '@/hooks/use-toast';
import { Timestamp } from '@/types/media';

interface EditingSectionProps {
  currentBlob: Blob;
  timestamps: Timestamp[];
  onSave: (newBlob: Blob) => void;
}

export const EditingSection = ({ currentBlob, timestamps, onSave }: EditingSectionProps) => {
  return (
    <VideoEditor 
      recordedBlob={currentBlob}
      timestamps={timestamps}
      onSave={(newBlob) => {
        onSave(newBlob);
        toast({
          title: "Video processed",
          description: "Your video has been processed successfully. You can preview and download it.",
        });
      }}
    />
  );
};