import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface WatermarkControlsProps {
  watermark: any;
  onWatermarkChange: (watermark: any) => void;
}

export const WatermarkControls = ({ watermark, onWatermarkChange }: WatermarkControlsProps) => {
  const handlePositionChange = (position: string) => {
    onWatermarkChange({
      ...watermark,
      position,
    });
  };

  const handleToggle = (enabled: boolean) => {
    if (enabled) {
      onWatermarkChange({
        enabled: true,
        position: 'top-left',
      });
    } else {
      onWatermarkChange(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          Watermark
          <Switch
            checked={!!watermark}
            onCheckedChange={handleToggle}
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {watermark && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Position</label>
              <Select
                value={watermark.position}
                onValueChange={handlePositionChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top-left">Top Left</SelectItem>
                  <SelectItem value="top-right">Top Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};