import React, { useState, useEffect } from 'react';
import { MainMenu } from "@/components/MainMenu";
import { HomePage } from "@/components/HomePage";
import { ThemeSelector } from '@/components/ThemeSelector';
import { RecordingComponent } from '@/components/RecordingComponent';
import { AIContentGenerator } from '@/components/AIContentGenerator';
import { supabase } from '../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/components/ui/use-toast";

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      if (session) {
        // Open recorder in a new window with user interaction
        const openRecorder = () => {
          const recorderWindow = window.open('/recorder', '_blank');
          if (recorderWindow) {
            recorderWindow.focus();
          } else {
            toast({
              title: "Popup Blocked",
              description: "Please allow popups to open the recorder",
              variant: "destructive"
            });
          }
        };
        
        // Create a button to open the recorder
        const button = document.createElement('button');
        button.innerText = 'Open Recorder';
        button.className = 'bg-primary text-white px-4 py-2 rounded hover:bg-primary/90';
        button.onclick = openRecorder;
        
        // Add button to the page
        const container = document.querySelector('.recorder-button-container');
        if (container) {
          container.appendChild(button);
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (email: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: crypto.randomUUID(),
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Check your email for the confirmation link"
      });
    } catch (error) {
      console.error('Error signing up:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  };

  const renderComponent = () => {
    switch (selectedComponent) {
      case 'home':
        return <HomePage setSelectedComponent={setSelectedComponent} onSignUp={handleSignUp} />;
      case 'recorder':
        if (!isAuthenticated) {
          toast({
            title: "Authentication Required",
            description: "Please sign in to access the screen recorder",
            variant: "destructive"
          });
          navigate('/signin');
          return null;
        }
        return <RecordingComponent />;
      case 'content':
        if (!isAuthenticated) {
          toast({
            title: "Authentication Required",
            description: "Please sign in to access the AI Content Generator",
            variant: "destructive"
          });
          navigate('/signin');
          return null;
        }
        return <AIContentGenerator />;
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
      <div className="absolute top-4 left-4 flex items-center gap-4">
        <MainMenu
          selectedComponent={selectedComponent}
          setSelectedComponent={setSelectedComponent}
        />
        <img 
          src="/lovable-uploads/d61c7c4e-e7ad-4177-bfd9-c819f5de7986.png"
          alt="ScreenCraft Logo"
          className="w-8 h-8"
        />
        <span className="text-lg font-semibold">Softwave</span>
      </div>
      
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center space-y-6 w-full max-w-7xl">
          <div className="flex flex-col items-center mb-8 space-y-4">
            <ThemeSelector currentTheme={currentTheme} onThemeChange={setCurrentTheme} />
          </div>
          <div className="recorder-button-container mb-4"></div>
          {renderComponent()}
        </div>
      </div>
    </div>
  );
};

export default Index;