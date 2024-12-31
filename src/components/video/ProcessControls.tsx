import React from 'react';
import { Button } from "@/components/ui/button";
import { Scissors } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

interface ProcessControlsProps {
  onProcess: () => void;
}

export const ProcessControls = ({ onProcess }: ProcessControlsProps) => {
  return (
    <Button onClick={onProcess} className="w-full">
      <Scissors className="w-4 h-4 mr-2" />
      Process Video
    </Button>
  );
};