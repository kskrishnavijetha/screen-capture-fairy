import React, { useState, useEffect } from 'react';
import { MainMenu } from "@/components/MainMenu";
import { HomePage } from "@/components/HomePage";
import { ThemeSelector } from '@/components/ThemeSelector';
import { AIContentGenerator } from '@/components/AIContentGenerator';
import { supabase } from '../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthError, AuthApiError } from '@supabase/supabase-js';

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
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (_event === 'SIGNED_IN') {
        toast({
          title: "Success",
          description: "Successfully signed in"
        });
      } else if (_event === 'SIGNED_OUT') {
        toast({
          title: "Signed out",
          description: "Successfully signed out"
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignUp = async (email: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: '', // You should implement proper password handling
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Please check your email for verification link"
      });
    } catch (error) {
      const err = error as AuthError;
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof AuthApiError ? err.message : "An error occurred"
      });
    }
  };

  const getErrorMessage = (error: AuthError) => {
    if (error instanceof AuthApiError) {
      switch (error.message) {
        case "Invalid login credentials":
          return 'Invalid email or password. Please check your credentials and try again.';
        case "Email not confirmed":
          return 'Please check your email for the confirmation link.';
        default:
          return error.message;
      }
    }
    return error.message;
  };

  const renderComponent = () => {
    if (!session) {
      return (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Welcome to Softwave</CardTitle>
          </CardHeader>
          <CardContent>
            <Auth
              supabaseClient={supabase}
              appearance={{ 
                theme: ThemeSupa,
                style: {
                  button: { background: '#9b87f5', color: 'white' },
                  anchor: { color: '#9b87f5' }
                }
              }}
              theme="dark"
              providers={[]}
            />
          </CardContent>
        </Card>
      );
    }

    switch (selectedComponent) {
      case 'home':
        return <HomePage setSelectedComponent={setSelectedComponent} onSignUp={handleSignUp} />;
      case 'content':
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
          {renderComponent()}
        </div>
      </div>
    </div>
  );
};

export default Index;
