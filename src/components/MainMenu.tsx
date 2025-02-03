import { Button } from "@/components/ui/button";
import { Menu, MonitorPlay, Home, Link2, Shield } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const MENU_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'recorder', label: 'Screen Recorder', icon: MonitorPlay },
  { id: 'protection', label: 'Data Protection', icon: Shield },
];

interface MainMenuProps {
  selectedComponent: string;
  setSelectedComponent: (component: string) => void;
}

export const MainMenu = ({
  selectedComponent,
  setSelectedComponent,
}: MainMenuProps) => {
  const handleComponentClick = (componentId: string) => {
    if (componentId === selectedComponent) {
      return;
    }

    if (componentId === 'recorder') {
      const width = 1024;
      const height = 768;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      window.open(
        '/recorder',
        'recorder',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      return;
    }

    setSelectedComponent(componentId);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader className="mb-4">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="space-y-2">
          <Button
            variant={selectedComponent === 'home' ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => handleComponentClick('home')}
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
            variant={selectedComponent === 'protection' ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => handleComponentClick('protection')}
          >
            <Shield className="mr-2 h-4 w-4" />
            Data Protection
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