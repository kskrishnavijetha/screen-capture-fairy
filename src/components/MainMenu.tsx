import { Button } from "@/components/ui/button";
import { Menu, MonitorPlay, Home, Link2, Share2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
    if (isAuthenticated) {
      window.open(`/${componentId}`, '_blank');
    } else {
      setSelectedComponent(componentId);
    }
  };

  return (
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
  );
};