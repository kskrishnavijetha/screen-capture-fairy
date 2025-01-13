import { Button } from "@/components/ui/button";
import { Menu, MonitorPlay, Home, User } from 'lucide-react';
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
          {MENU_ITEMS.map((item) => (
            <Button
              key={item.id}
              variant={selectedComponent === item.id ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setSelectedComponent(item.id)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          ))}
          {isAuthenticated && (
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate('/user')}
            >
              <User className="mr-2 h-4 w-4" />
              User Profile
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};