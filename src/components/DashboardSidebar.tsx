import { Home, Library, Bell, Bookmark, History, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const DashboardSidebar = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Library, label: 'My Library', path: '/library' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Bookmark, label: 'Watch Later', path: '/watch-later' },
    { icon: History, label: 'History', path: '/history' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="w-64 h-screen bg-sidebar border-r border-border flex flex-col">
      <div className="p-4 space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate(item.path)}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Button>
        ))}
      </div>
      <div className="mt-auto p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};