import React from 'react';
import { Button } from "@/components/ui/button";
import { Scissors } from 'lucide-react';

interface ProcessControlsProps {
  onProcess: () => void;
  isProcessing: boolean;
}

export const ProcessControls = ({ onProcess, isProcessing }: ProcessControlsProps) => {
  return (
    <Button 
      onClick={onProcess} 
      className="w-full"
      disabled={isProcessing}
    >
      <Scissors className="w-4 h-4 mr-2" />
      {isProcessing ? 'Processing...' : 'Process Video'}
    </Button>
  );
};