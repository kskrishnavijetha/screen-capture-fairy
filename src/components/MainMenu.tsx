import { Button } from "@/components/ui/button";
import { Menu, MonitorPlay, Home } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const MENU_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'recorder', label: 'Screen Recorder', icon: MonitorPlay },
];

interface MainMenuProps {
  selectedComponent: string;
  setSelectedComponent: (id: string) => void;
}

export const MainMenu = ({ selectedComponent, setSelectedComponent }: MainMenuProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
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
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    if (componentId === 'recorder') {
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
        </div>
      </SheetContent>
    </Sheet>
  );
};