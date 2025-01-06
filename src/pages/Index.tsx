import React, { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { HeroSection } from "@/components/HeroSection";
import { ThemeSelector } from '@/components/ThemeSelector';

const Index = () => {
  const [currentTheme, setCurrentTheme] = useState('Default Dark');

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1">
          <div className="flex justify-between items-center p-4">
            <SidebarTrigger />
            <ThemeSelector currentTheme={currentTheme} onThemeChange={setCurrentTheme} />
          </div>
          <HeroSection />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;