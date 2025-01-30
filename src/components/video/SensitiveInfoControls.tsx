import React, { useState } from 'react';
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DetectionRule } from '@/utils/objectDetection';
import { Eye, EyeOff, Plus, Trash2 } from 'lucide-react';

interface SensitiveInfoControlsProps {
  rules: DetectionRule[];
  onChange: (rules: DetectionRule[]) => void;
}

export const SensitiveInfoControls: React.FC<SensitiveInfoControlsProps> = ({
  rules,
  onChange
}) => {
  const [customPattern, setCustomPattern] = useState('');

  const handleToggle = (index: number) => {
    const newRules = [...rules];
    newRules[index].enabled = !newRules[index].enabled;
    onChange(newRules);
  };

  const addCustomRule = () => {
    if (!customPattern) return;
    onChange([
      ...rules,
      {
        type: 'email', // Default type for custom patterns
        enabled: true,
        customPattern
      }
    ]);
    setCustomPattern('');
  };

  const removeRule = (index: number) => {
    const newRules = rules.filter((_, i) => i !== index);
    onChange(newRules);
  };

  return (
    <div className="space-y-4 p-4 rounded-lg border bg-card">
      <h3 className="text-lg font-semibold mb-4">Privacy Controls</h3>
      
      <div className="space-y-3">
        {rules.map((rule, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {rule.enabled ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
              <span>{rule.customPattern || rule.type}</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={rule.enabled}
                onCheckedChange={() => handleToggle(index)}
              />
              {rule.customPattern && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRule(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <Input
          placeholder="Add custom pattern (regex)"
          value={customPattern}
          onChange={(e) => setCustomPattern(e.target.value)}
        />
        <Button onClick={addCustomRule}>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>
    </div>
  );
};