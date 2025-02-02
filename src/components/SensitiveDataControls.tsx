import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, Shield } from 'lucide-react';
import type { SensitiveDataType } from '@/utils/sensitiveDataDetection';

interface SensitiveDataControlsProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  selectedTypes: SensitiveDataType[];
  onTypesChange: (types: SensitiveDataType[]) => void;
}

export const SensitiveDataControls = ({
  enabled,
  onToggle,
  selectedTypes,
  onTypesChange,
}: SensitiveDataControlsProps) => {
  const dataTypes: { label: string; value: SensitiveDataType }[] = [
    { label: 'Email Addresses', value: 'email' },
    { label: 'Phone Numbers', value: 'phone' },
    { label: 'Credit Card Numbers', value: 'creditCard' },
    { label: 'Social Security Numbers', value: 'ssn' },
  ];

  const handleTypeToggle = (type: SensitiveDataType) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    onTypesChange(newTypes);
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4" />
          <span className="font-medium">Sensitive Data Protection</span>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={onToggle}
          className="ml-2"
        />
      </div>

      {enabled && (
        <div className="space-y-2">
          {dataTypes.map(({ label, value }) => (
            <div key={value} className="flex items-center space-x-2">
              <Checkbox
                id={value}
                checked={selectedTypes.includes(value)}
                onCheckedChange={() => handleTypeToggle(value)}
              />
              <label
                htmlFor={value}
                className="text-sm flex items-center space-x-2"
              >
                {selectedTypes.includes(value) ? (
                  <EyeOff className="w-3 h-3" />
                ) : (
                  <Eye className="w-3 h-3" />
                )}
                <span>{label}</span>
              </label>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};