import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Resolution } from '@/types/recording';

interface RecordingSettingsProps {
  countdownSeconds: number;
  setCountdownSeconds: (value: number) => void;
  frameRate: number;
  setFrameRate: (value: number) => void;
  selectedResolution: Resolution;
  setSelectedResolution: (resolution: Resolution) => void;
  resolutions: Resolution[];
  isRecording: boolean;
}

export const RecordingSettings: React.FC<RecordingSettingsProps> = ({
  countdownSeconds,
  setCountdownSeconds,
  frameRate,
  setFrameRate,
  selectedResolution,
  setSelectedResolution,
  resolutions,
  isRecording
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <label htmlFor="countdown" className="text-sm font-medium">
          Countdown Timer (seconds)
        </label>
        <Select
          value={countdownSeconds.toString()}
          onValueChange={(value) => setCountdownSeconds(Number(value))}
          disabled={isRecording}
        >
          <SelectTrigger id="countdown">
            <SelectValue placeholder="Select countdown duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3 seconds</SelectItem>
            <SelectItem value="5">5 seconds</SelectItem>
            <SelectItem value="10">10 seconds</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col space-y-2">
        <label htmlFor="frameRate" className="text-sm font-medium">
          Frame Rate
        </label>
        <Select
          value={frameRate.toString()}
          onValueChange={(value) => setFrameRate(Number(value))}
          disabled={isRecording}
        >
          <SelectTrigger id="frameRate">
            <SelectValue placeholder="Select frame rate" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="60">60 FPS</SelectItem>
            <SelectItem value="120">120 FPS</SelectItem>
            <SelectItem value="144">144 FPS</SelectItem>
            <SelectItem value="240">240 FPS</SelectItem>
            <SelectItem value="300">300 FPS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col space-y-2">
        <label htmlFor="resolution" className="text-sm font-medium">
          Resolution
        </label>
        <Select
          value={selectedResolution.label}
          onValueChange={(value) => {
            const resolution = resolutions.find(r => r.label === value);
            if (resolution) setSelectedResolution(resolution);
          }}
          disabled={isRecording}
        >
          <SelectTrigger id="resolution">
            <SelectValue placeholder="Select resolution" />
          </SelectTrigger>
          <SelectContent>
            {resolutions.map((resolution) => (
              <SelectItem key={resolution.label} value={resolution.label}>
                {resolution.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};