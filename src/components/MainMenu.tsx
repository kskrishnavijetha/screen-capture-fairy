import { Button } from "@/components/ui/button";
import { Menu, MonitorPlay, Home, Link2, Share2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const MENU_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'recorder', label: 'Screen Recorder', icon: MonitorPlay },
  { id: 'safeshare', label: 'SafeShare', icon: Share2 },
];

interface MainMenuProps {
  selectedComponent: string;
  setSelectedComponent: (id: string) => void;
}

export const MainMenu = ({ selectedComponent, setSelectedComponent }: MainMenuProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showRecorderDialog, setShowRecorderDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleComponentClick = (componentId: string) => {
    if (componentId === 'recorder') {
      setShowRecorderDialog(true);
      return;
    }

    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    if (componentId === 'safeshare') {
      const width = 1024;
      const height = 768;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      window.open(
        `/${componentId}`,
        componentId,
        `width=${width},height=${height},top=${top},left=${left},noopener,noreferrer`
      );
    } else {
      setSelectedComponent(componentId);
    }
  };

  const handleStartRecording = () => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    const width = 1024;
    const height = 768;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      '/recorder',
      'recorder',
      `width=${width},height=${height},top=${top},left=${left},noopener,noreferrer`
    );
    setShowRecorderDialog(false);
  };

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-2">
            <Button
              variant={selectedComponent === 'home' ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setSelectedComponent('home')}
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
            <Button
              variant={selectedComponent === 'recorder' ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => handleComponentClick('recorder')}
            >
              <MonitorPlay className="mr-2 h-4 w-4" />
              Screen Recorder
            </Button>
            <Button
              variant={selectedComponent === 'safeshare' ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => handleComponentClick('safeshare')}
            >
              <Share2 className="mr-2 h-4 w-4" />
              SafeShare
            </Button>
            <a 
              href="https://x.com/softwave1116" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              <Link2 className="h-4 w-4" />
              <span>Connect on X</span>
            </a>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={showRecorderDialog} onOpenChange={setShowRecorderDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold tracking-tight leading-tight text-center">
              Record Your Screen Anywhere, Anytime
            </DialogTitle>
            <DialogDescription className="text-center mt-4">
              Easily capture your screen directly from your browser—no downloads or installations required. Whether you're creating tutorials, recording meetings, or sharing gameplay, our free screen recorder is fast, secure, and hassle-free. Start recording in just one click!
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-4 mt-6">
            <Button 
              onClick={handleStartRecording}
              className="bg-primary hover:bg-primary/90"
            >
              Start Recording Now
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowRecorderDialog(false);
                navigate('/signup');
              }}
            >
              Create Free Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};