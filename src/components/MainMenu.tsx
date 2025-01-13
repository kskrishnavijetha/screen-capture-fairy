import { Button } from "@/components/ui/button";
import { Menu, MonitorPlay, Home } from 'lucide-react';
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
];

interface MainMenuProps {
  selectedComponent: string;
  setSelectedComponent: (id: string) => void;
}

export const MainMenu = ({ selectedComponent, setSelectedComponent }: MainMenuProps) => {
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
        </div>
      </SheetContent>
    </Sheet>
  );
};