import React, { useState } from 'react';
import { MainMenu } from "@/components/MainMenu";
import { HomePage } from "@/components/HomePage";
import { ThemeSelector } from '@/components/ThemeSelector';
import { RecordingComponent } from '@/components/RecordingComponent';
import { supabase } from '../integrations/supabase/client';

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

  const handleSignUp = async (email: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: crypto.randomUUID(), // Generate a random password
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
      
      // Show success message
      alert('Check your email for the confirmation link');
    } catch (error) {
      console.error('Error signing up:', error);
      alert(error.message);
    }
  };

  const renderComponent = () => {
    switch (selectedComponent) {
      case 'home':
        return <HomePage setSelectedComponent={setSelectedComponent} onSignUp={handleSignUp} />;
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
        return <HomePage setSelectedComponent={setSelectedComponent} onSignUp={handleSignUp} />;
    }
  };

  return (
    <div className={`min-h-screen p-4 transition-colors duration-200 ${getThemeClasses(currentTheme)}`}>
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
  );
};

export default Index;