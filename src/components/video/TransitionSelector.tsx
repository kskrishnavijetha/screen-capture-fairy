import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TransitionSelectorProps {
  value: 'none' | 'fade' | 'crossfade';
  onChange: (value: 'none' | 'fade' | 'crossfade') => void;
}

export const TransitionSelector: React.FC<TransitionSelectorProps> = ({
  value,
  onChange
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Transition Effect</label>
      <Select
        value={value}
        onValueChange={onChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select transition type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          <SelectItem value="fade">Fade</SelectItem>
          <SelectItem value="crossfade">Cross Fade</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};