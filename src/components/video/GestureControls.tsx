import React, { useState } from 'react';
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ThumbsUp, Hand, Heart, Star, Smile } from 'lucide-react';

export type GestureConfig = {
  enabled: boolean;
  gesture: string;
  emoji: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
};

interface GestureControlsProps {
  onConfigChange: (config: GestureConfig) => void;
}

const GESTURES = [
  { value: 'thumbs-up', label: 'Thumbs Up', icon: ThumbsUp },
  { value: 'peace', label: 'Peace Sign', icon: Hand },
  { value: 'heart', label: 'Heart Hands', icon: Heart },
];

const EMOJIS = [
  { value: '👍', label: 'Thumbs Up', icon: ThumbsUp },
  { value: '❤️', label: 'Heart', icon: Heart },
  { value: '⭐', label: 'Star', icon: Star },
  { value: '😊', label: 'Smile', icon: Smile },
];

const POSITIONS = [
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-right', label: 'Bottom Right' },
];

export const GestureControls: React.FC<GestureControlsProps> = ({ onConfigChange }) => {
  const [config, setConfig] = useState<GestureConfig>({
    enabled: false,
    gesture: 'thumbs-up',
    emoji: '👍',
    position: 'top-right',
  });

  const handleConfigChange = (changes: Partial<GestureConfig>) => {
    const newConfig = { ...config, ...changes };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="gesture-detection" className="font-medium">
          Gesture Detection
        </Label>
        <Switch
          id="gesture-detection"
          checked={config.enabled}
          onCheckedChange={(enabled) => handleConfigChange({ enabled })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gesture-type">Gesture Type</Label>
        <Select
          value={config.gesture}
          onValueChange={(gesture) => handleConfigChange({ gesture })}
          disabled={!config.enabled}
        >
          <SelectTrigger id="gesture-type">
            <SelectValue placeholder="Select gesture" />
          </SelectTrigger>
          <SelectContent>
            {GESTURES.map(({ value, label, icon: Icon }) => (
              <SelectItem key={value} value={value}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="emoji-type">Emoji Reaction</Label>
        <Select
          value={config.emoji}
          onValueChange={(emoji) => handleConfigChange({ emoji })}
          disabled={!config.enabled}
        >
          <SelectTrigger id="emoji-type">
            <SelectValue placeholder="Select emoji" />
          </SelectTrigger>
          <SelectContent>
            {EMOJIS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{value}</span>
                  <span>{label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="position">Emoji Position</Label>
        <Select
          value={config.position}
          onValueChange={(position: GestureConfig['position']) => 
            handleConfigChange({ position })
          }
          disabled={!config.enabled}
        >
          <SelectTrigger id="position">
            <SelectValue placeholder="Select position" />
          </SelectTrigger>
          <SelectContent>
            {POSITIONS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
};