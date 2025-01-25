import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Home,
  Library,
  Calendar,
  Bell,
  Bookmark,
  Clock,
  Gift,
  Settings,
  ChevronDown,
  UserPlus,
  Users
} from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';

export function AppSidebar() {
  const navigate = useNavigate();
  const [userName, setUserName] = React.useState<string>('');

  React.useEffect(() => {
    getUserName();
  }, []);

  const getUserName = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      setUserName(user.email.split('@')[0]);
    }
  };

  const menuItems = [
    { title: "Home", icon: Home, path: "/" },
    { title: "My Library", icon: Library, path: "/library", isActive: true },
    { title: "Meetings", icon: Calendar, path: "/meetings", badge: "Beta" },
    { title: "Notifications", icon: Bell, path: "/notifications", count: 2 },
    { title: "Watch Later", icon: Bookmark, path: "/watch-later" },
    { title: "History", icon: Clock, path: "/history" },
    { title: "Earn free videos", icon: Gift, path: "/earn", badge: "New!" },
    { title: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="p-4 space-y-4">
            <Button
              variant="ghost"
              className="w-full justify-between font-medium"
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{userName}'s Workspace</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Invite teammates
            </Button>
          </div>

          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    className={item.isActive ? 'bg-accent' : ''}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className="ml-auto"
                      >
                        {item.badge}
                      </Badge>
                    )}
                    {item.count && (
                      <Badge
                        variant="destructive"
                        className="ml-auto rounded-full w-5 h-5 flex items-center justify-center p-0"
                      >
                        {item.count}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}