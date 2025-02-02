import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Camera, Layout, Eraser } from 'lucide-react';

interface CameraControlsSidebarProps {
  selectedCamera: string;
  setSelectedCamera: (value: string) => void;
  availableCameras: MediaDeviceInfo[];
  layout: 'corner' | 'side' | 'full';
  setLayout: (value: 'corner' | 'side' | 'full') => void;
  removeBackgroundEnabled: boolean;
  setRemoveBackgroundEnabled: (value: boolean) => void;
}

export function CameraControlsSidebar({
  selectedCamera,
  setSelectedCamera,
  availableCameras,
  layout,
  setLayout,
  removeBackgroundEnabled,
  setRemoveBackgroundEnabled,
}: CameraControlsSidebarProps) {
  return (
    <Sidebar className="border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Camera Settings</SidebarGroupLabel>
          <SidebarGroupContent className="space-y-4 px-2">
            <div className="space-y-1">
              <label className="text-sm font-medium flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Camera Source
              </label>
              <Select value={selectedCamera} onValueChange={setSelectedCamera}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select camera" />
                </SelectTrigger>
                <SelectContent>
                  {availableCameras.map((camera) => (
                    <SelectItem key={camera.deviceId} value={camera.deviceId}>
                      {camera.label || `Camera ${camera.deviceId.slice(0, 4)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium flex items-center gap-2">
                <Layout className="h-4 w-4" />
                Layout
              </label>
              <Select 
                value={layout} 
                onValueChange={(value: 'corner' | 'side' | 'full') => setLayout(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Layout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corner">Corner</SelectItem>
                  <SelectItem value="side">Side</SelectItem>
                  <SelectItem value="full">Full</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium flex items-center gap-2">
                <Eraser className="h-4 w-4" />
                Background Removal
              </label>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <div className="text-sm">Remove Background</div>
                  <div className="text-muted-foreground text-xs">
                    AI-powered background removal
                  </div>
                </div>
                <Switch
                  checked={removeBackgroundEnabled}
                  onCheckedChange={setRemoveBackgroundEnabled}
                />
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}