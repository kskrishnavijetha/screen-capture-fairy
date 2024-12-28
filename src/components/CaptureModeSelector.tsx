import React from 'react';
import { Monitor, Camera, Video } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export type CaptureMode = 'screen' | 'camera' | 'both';

interface CaptureModeProps {
  mode: CaptureMode;
  onChange: (mode: CaptureMode) => void;
}

export const CaptureModeSelector = ({ mode, onChange }: CaptureModeProps) => {
  return (
    <div className="mb-6">
      <h2 className="text-sm font-medium mb-3">What do you want to capture?</h2>
      <RadioGroup
        value={mode}
        onValueChange={(value) => onChange(value as CaptureMode)}
        className="flex space-x-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="screen" id="screen" />
          <Label htmlFor="screen" className="flex items-center space-x-2 cursor-pointer">
            <Monitor className="h-4 w-4" />
            <span>Screen only</span>
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem value="camera" id="camera" />
          <Label htmlFor="camera" className="flex items-center space-x-2 cursor-pointer">
            <Camera className="h-4 w-4" />
            <span>Camera only</span>
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem value="both" id="both" />
          <Label htmlFor="both" className="flex items-center space-x-2 cursor-pointer">
            <Video className="h-4 w-4" />
            <span>Screen & Camera</span>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};