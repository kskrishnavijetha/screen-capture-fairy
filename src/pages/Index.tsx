import React, { useState, useEffect } from 'react';
import { MainMenu } from "@/components/MainMenu";
import { HomePage } from "@/components/HomePage";
import { ThemeSelector } from '@/components/ThemeSelector';
import { RecordingComponent } from '@/components/RecordingComponent';
import { supabase } from "@/integrations/supabase/client";
import { SignInDialog } from "@/components/auth/SignInDialog";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ProfileSection } from "@/components/ProfileSection";

const getThemeClasses = (themeName: string) => {
  switch (themeName) {
    case 'Ocean':
      return 'bg-[#222222] accent-[#0EA5E9]';
    case 'Forest':
      return 'bg-[#221F26] accent-[#22C55E]';
    case 'Sunset':
      return 'bg-[#403E43] accent-[#F97316]';
    case 'Berry':
      return 'bg-[#1A1F2C] accent-[#D946EF]';
    default:
      return 'bg-[#1A1F2C] accent-[#9b87f5]';
  }
};

const Index = () => {
  const [selectedComponent, setSelectedComponent] = useState('home');
  const [currentTheme, setCurrentTheme] = useState('Default Dark');
  const [session, setSession] = useState<any>(null);
  const [showSignIn, setShowSignIn] = useState(false);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const renderComponent = () => {
    if (!session) {
      return <HomePage setSelectedComponent={setSelectedComponent} />;
    }

    switch (selectedComponent) {
      case 'home':
        return <RecordingComponent />;
      case 'recorder':
        return <RecordingComponent />;
      case 'content':
        return <div className="text-center">AI Content Generator Coming Soon</div>;
      case 'video':
        return <div className="text-center">AI Short Video Generator Coming Soon</div>;
      case 'calendar':
        return <div className="text-center">Content Calendar Coming Soon</div>;
      case 'analytics':
        return <div className="text-center">Social Media Analytics Coming Soon</div>;
      case 'monetization':
        return <div className="text-center">Monetization Hub Coming Soon</div>;
      default:
        return <RecordingComponent />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${getThemeClasses(currentTheme)}`}>
      {session ? (
        <div className="flex">
          <DashboardSidebar />
          <div className="flex-1 relative">
            <ProfileSection />
            <div className="p-4">
              <div className="flex justify-end mb-4">
                <ThemeSelector currentTheme={currentTheme} onThemeChange={setCurrentTheme} />
              </div>
              {renderComponent()}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="absolute top-4 left-4">
            <MainMenu
              selectedComponent={selectedComponent}
              setSelectedComponent={setSelectedComponent}
            />
          </div>
          <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="text-center space-y-6 w-full max-w-7xl">
              <div className="flex flex-col items-center mb-8 space-y-4">
                <ThemeSelector currentTheme={currentTheme} onThemeChange={setCurrentTheme} />
              </div>
              {renderComponent()}
            </div>
          </div>
        </div>
      )}

      <SignInDialog open={showSignIn} onOpenChange={setShowSignIn} />
    </div>
  );
};

export default Index;