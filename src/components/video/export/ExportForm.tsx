import React from 'react';
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExportFormProps {
  filename: string;
  setFilename: (value: string) => void;
  selectedFormat: string;
  setSelectedFormat: (value: string) => void;
  isPasswordProtected: boolean;
  setIsPasswordProtected: (value: boolean) => void;
  password: string;
  setPassword: (value: string) => void;
  isExporting: boolean;
}

export const ExportForm = ({
  filename,
  setFilename,
  selectedFormat,
  setSelectedFormat,
  isPasswordProtected,
  setIsPasswordProtected,
  password,
  setPassword,
  isExporting
}: ExportFormProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Filename</label>
        <Input
          type="text"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          disabled={isExporting}
          placeholder="Enter filename"
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Export Format</label>
        <Select
          value={selectedFormat}
          onValueChange={setSelectedFormat}
          disabled={isExporting || isPasswordProtected}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select export format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="webm">WebM</SelectItem>
            <SelectItem value="mp4">MP4</SelectItem>
            <SelectItem value="gif">GIF</SelectItem>
            <SelectItem value="avi">AVI</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between space-x-2">
        <label className="text-sm font-medium">Password Protection</label>
        <Switch
          checked={isPasswordProtected}
          onCheckedChange={setIsPasswordProtected}
          disabled={isExporting}
        />
      </div>

      {isPasswordProtected && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <Input
            type="password"
            placeholder="Enter password (min. 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isExporting}
          />
        </div>
      )}
    </div>
  );
};