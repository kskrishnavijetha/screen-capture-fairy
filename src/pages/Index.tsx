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
    a.download = 'recording.webm';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Recording Saved",
      description: "Your recording has been saved"
    });
  }, []);

  const renderComponent = () => {
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
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar onSelectComponent={setSelectedComponent} />
        <div className="flex-1 relative">
          <MainHeader />
          <main className="p-4 mt-16">
            {renderComponent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;