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
    <Card className="bg-black/80 backdrop-blur-sm border-white/10 p-4 space-y-4 text-white shadow-xl">
      <div className="flex items-center justify-between">
        <Label htmlFor="gesture-detection" className="font-medium">
          Gesture Detection
        </Label>
        <Switch
          id="gesture-detection"
          checked={config.enabled}
          onCheckedChange={(enabled) => handleConfigChange({ enabled })}
          className="data-[state=checked]:bg-primary"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gesture-type">Gesture Type</Label>
        <Select
          value={config.gesture}
          onValueChange={(gesture) => handleConfigChange({ gesture })}
          disabled={!config.enabled}
        >
          <SelectTrigger id="gesture-type" className="bg-black/50 border-white/10">
            <SelectValue placeholder="Select gesture" />
          </SelectTrigger>
          <SelectContent className="bg-black/90 border-white/10">
            {GESTURES.map(({ value, label, icon: Icon }) => (
              <SelectItem key={value} value={value} className="text-white">
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
          <SelectTrigger id="emoji-type" className="bg-black/50 border-white/10">
            <SelectValue placeholder="Select emoji" />
          </SelectTrigger>
          <SelectContent className="bg-black/90 border-white/10">
            {EMOJIS.map(({ value, label }) => (
              <SelectItem key={value} value={value} className="text-white">
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
          <SelectTrigger id="position" className="bg-black/50 border-white/10">
            <SelectValue placeholder="Select position" />
          </SelectTrigger>
          <SelectContent className="bg-black/90 border-white/10">
            {POSITIONS.map(({ value, label }) => (
              <SelectItem key={value} value={value} className="text-white">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
};