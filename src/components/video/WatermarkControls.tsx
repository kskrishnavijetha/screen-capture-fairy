import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ImageIcon } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

export interface Watermark {
  image: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  opacity: number;
  size: number;
}

interface WatermarkControlsProps {
  watermark: Watermark | null;
  onWatermarkChange: (watermark: Watermark | null) => void;
}

export const WatermarkControls = ({ watermark, onWatermarkChange }: WatermarkControlsProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEnabled, setIsEnabled] = useState(!!watermark);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const image = e.target?.result as string;
        if (image) {
          onWatermarkChange({
            image,
            position: 'bottom-right',
            opacity: 0.8,
            size: 20
          });
          toast({
            title: "Watermark added",
            description: "Your logo has been added as a watermark"
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePositionChange = (position: Watermark['position']) => {
    if (watermark) {
      onWatermarkChange({ ...watermark, position });
    }
  };

  const handleEnableChange = (enabled: boolean) => {
    setIsEnabled(enabled);
    if (!enabled) {
      onWatermarkChange(null);
      toast({
        title: "Watermark disabled",
        description: "The watermark has been removed"
      });
    } else if (selectedFile) {
      // Re-trigger file change to restore watermark
      const input = document.getElementById('watermark-upload') as HTMLInputElement;
      if (input.files?.length) {
        handleFileChange({ target: input } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Enable Watermark</label>
        <Switch
          checked={isEnabled}
          onCheckedChange={handleEnableChange}
        />
      </div>

      {isEnabled && (
        <>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => document.getElementById('watermark-upload')?.click()}
              className="w-full"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              {watermark ? 'Change Logo' : 'Add Logo'}
            </Button>
            {watermark && (
              <Button
                variant="destructive"
                onClick={() => {
                  onWatermarkChange(null);
                  setSelectedFile(null);
                  toast({
                    title: "Watermark removed",
                    description: "The watermark has been removed"
                  });
                }}
              >
                Remove
              </Button>
            )}
          </div>

          <input
            type="file"
            id="watermark-upload"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />

          {watermark && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={watermark.position === 'top-left' ? 'default' : 'outline'}
                  onClick={() => handlePositionChange('top-left')}
                  size="sm"
                >
                  Top Left
                </Button>
                <Button
                  variant={watermark.position === 'top-right' ? 'default' : 'outline'}
                  onClick={() => handlePositionChange('top-right')}
                  size="sm"
                >
                  Top Right
                </Button>
                <Button
                  variant={watermark.position === 'bottom-left' ? 'default' : 'outline'}
                  onClick={() => handlePositionChange('bottom-left')}
                  size="sm"
                >
                  Bottom Left
                </Button>
                <Button
                  variant={watermark.position === 'bottom-right' ? 'default' : 'outline'}
                  onClick={() => handlePositionChange('bottom-right')}
                  size="sm"
                >
                  Bottom Right
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Opacity ({Math.round(watermark.opacity * 100)}%)</label>
                <Slider
                  value={[watermark.opacity * 100]}
                  onValueChange={(value) => onWatermarkChange({ ...watermark, opacity: value[0] / 100 })}
                  min={1}
                  max={100}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Size ({watermark.size}%)</label>
                <Slider
                  value={[watermark.size]}
                  onValueChange={(value) => onWatermarkChange({ ...watermark, size: value[0] })}
                  min={5}
                  max={50}
                  step={1}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};