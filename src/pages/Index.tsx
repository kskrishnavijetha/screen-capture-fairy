import React, { useState, useEffect } from 'react';
import { MainMenu } from "@/components/MainMenu";
import { HomePage } from "@/components/HomePage";
import { RecordingComponent } from "@/components/RecordingComponent";
import { AIContentGenerator } from '@/components/AIContentGenerator';
import { UserPresence } from '@/components/UserPresence';
import { supabase } from '../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/components/ui/use-toast";
import { User } from '@supabase/supabase-js';

const Index = () => {
  const [selectedComponent, setSelectedComponent] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setUser(session?.user || null);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setUser(session?.user || null);
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
            description: "Please sign in to access the Screen Recorder",
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
      default:
        return <HomePage setSelectedComponent={setSelectedComponent} onSignUp={handleSignUp} />;
    }
  };

  return (
    <div 
      className="min-h-screen p-4 font-sans bg-gradient-to-br from-primary to-primary-light"
      style={{
        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(79, 70, 229, 0.4) 0%, rgba(129, 140, 248, 0.2) 90%)'
      }}
    >
      <div className="absolute top-4 left-4 flex items-center gap-4 animate-fade-in">
        <MainMenu
          selectedComponent={selectedComponent}
          setSelectedComponent={setSelectedComponent}
        />
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
          <img 
            src="/lovable-uploads/d61c7c4e-e7ad-4177-bfd9-c819f5de7986.png"
            alt="ScreenCraft Logo"
            className="w-8 h-8"
          />
          <span className="text-lg font-semibold text-white">Softwave</span>
        </div>
        {isAuthenticated && <UserPresence user={user} />}
      </div>
      
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center space-y-6 w-full max-w-7xl animate-scale-in">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-white/10">
            {renderComponent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;