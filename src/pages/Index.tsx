import React, { useState, useCallback } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { MainHeader } from "@/components/layout/MainHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentCalendar } from "@/components/content/ContentCalendar";
import { AIGenerator } from "@/components/content/AIGenerator";
import { Analytics } from "@/components/content/Analytics";
import { MonetizationHub } from "@/components/content/MonetizationHub";
import { RecordingManager } from '@/components/RecordingManager';
import { Resolution } from '@/types/recording';
import { CaptureMode } from '@/components/CaptureModeSelector';
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedComponent, setSelectedComponent] = useState<string>("recorder");
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const defaultResolution: Resolution = {
    label: '1080p',
    width: 1920,
    height: 1080
  };

  const handleRecordingStart = useCallback(() => {
    toast({
      title: "Recording Started",
      description: "Your screen recording has begun"
    });
  }, []);

  const handleRecordingStop = useCallback((blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `screen-recording-${new Date().toISOString()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Recording Saved",
      description: "Your recording has been saved"
    });
  }, []);

  const recordingProps = {
    captureMode: 'screen' as CaptureMode,
    frameRate: 30,
    resolution: defaultResolution,
    onRecordingStart: handleRecordingStart,
    onRecordingStop: handleRecordingStop,
    isRecording,
    setIsRecording,
    isPaused,
    setIsPaused
  };

  const renderComponent = () => {
    switch (selectedComponent) {
      case "calendar":
        return <ContentCalendar />;
      case "generator":
        return <AIGenerator />;
      case "recorder":
        return <RecordingManager {...recordingProps} />;
      case "analytics":
        return <Analytics />;
      case "monetization":
        return <MonetizationHub />;
      default:
        return <RecordingManager {...recordingProps} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar onSelectComponent={setSelectedComponent} />
      <div className="flex-1">
        <MainHeader />
        <main className="p-4 mt-16">
          {renderComponent()}
        </main>
      </div>
    </div>
  );
};

export default Index;