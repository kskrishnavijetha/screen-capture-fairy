import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MicOff } from 'lucide-react';

interface FillerWordControlsProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const FillerWordControls = ({ enabled, onToggle }: FillerWordControlsProps) => {
  return (
    <div className="flex items-center justify-between space-x-4 p-4 rounded-lg border bg-card">
      <div className="flex items-center space-x-3">
        <MicOff className="h-5 w-5 text-muted-foreground" />
        <Label htmlFor="filler-word-removal">Remove filler words</Label>
      </div>
      <Switch
        id="filler-word-removal"
        checked={enabled}
        onCheckedChange={onToggle}
      />
    </div>
  );
};