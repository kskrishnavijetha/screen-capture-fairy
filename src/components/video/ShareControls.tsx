import React from 'react';
import { LinkShareControls } from './LinkShareControls';

interface ShareControlsProps {
  recordedBlob: Blob | null;
}

export const ShareControls = ({ recordedBlob }: ShareControlsProps) => {
  return (
    <div className="space-y-4 bg-card p-4 rounded-lg border border-border">
      <h3 className="text-lg font-semibold mb-4">Share Video</h3>
      <LinkShareControls recordedBlob={recordedBlob} />
    </div>
  );
};