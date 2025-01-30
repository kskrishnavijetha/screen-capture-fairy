import React from 'react';
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface ConfidenceThresholdControlsProps {
  threshold: number;
  onThresholdChange: (value: number) => void;
}

export const ConfidenceThresholdControls: React.FC<ConfidenceThresholdControlsProps> = ({
  threshold,
  onThresholdChange
}) => {
  return (
    <div className="space-y-4 p-4 rounded-lg border bg-card">
      <div className="flex items-center justify-between">
        <Label htmlFor="confidence-threshold">Confidence Threshold</Label>
        <span className="text-sm text-muted-foreground">{threshold * 100}%</span>
      </div>
      <Slider
        id="confidence-threshold"
        min={0}
        max={1}
        step={0.1}
        value={[threshold]}
        onValueChange={([value]) => onThresholdChange(value)}
      />
    </div>
  );
};