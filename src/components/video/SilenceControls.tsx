import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RotateCcw } from 'lucide-react';

interface SilenceControlsProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const SilenceControls = ({ enabled, onToggle }: SilenceControlsProps) => {
  return (
    <div className="flex items-center justify-between space-x-4 p-4 rounded-lg border bg-card">
      <div className="flex items-center space-x-3">
        <RotateCcw className="h-5 w-5 text-muted-foreground" />
        <Label htmlFor="silence-removal">Remove silences</Label>
      </div>
      <Switch
        id="silence-removal"
        checked={enabled}
        onCheckedChange={onToggle}
      />
    </div>
  );
};