import React, { useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { MainHeader } from "@/components/layout/MainHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentCalendar } from "@/components/content/ContentCalendar";
import { AIGenerator } from "@/components/content/AIGenerator";
import { Analytics } from "@/components/content/Analytics";
import { MonetizationHub } from "@/components/content/MonetizationHub";
import { RecordingManager } from '@/components/RecordingManager';

const Index = () => {
  const [selectedComponent, setSelectedComponent] = useState<string>("recorder");

  const renderComponent = () => {
    switch (selectedComponent) {
      case "calendar":
        return <ContentCalendar />;
      case "generator":
        return <AIGenerator />;
      case "recorder":
        return <RecordingManager />;
      case "analytics":
        return <Analytics />;
      case "monetization":
        return <MonetizationHub />;
      default:
        return <RecordingManager />;
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