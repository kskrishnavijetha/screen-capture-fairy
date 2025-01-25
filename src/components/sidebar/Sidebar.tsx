import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
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
  UserPlus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  userName?: string;
}

export const Sidebar = ({ userName = "User's Workspace" }: SidebarProps) => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Library, label: 'My Library', path: '/library', isActive: true },
    { icon: Calendar, label: 'Meetings', path: '/meetings', badge: 'Beta' },
    { icon: Bell, label: 'Notifications', path: '/notifications', badge: '2' },
    { icon: Bookmark, label: 'Watch Later', path: '/watch-later' },
    { icon: Clock, label: 'History', path: '/history' },
    { icon: Gift, label: 'Earn free videos', path: '/earn', badge: 'New!' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="w-64 h-screen bg-background border-r border-secondary flex flex-col">
      {/* Workspace Section */}
      <div className="p-4 border-b border-secondary">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-between text-left font-medium hover:bg-secondary/50"
            >
              {userName}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button 
          variant="ghost" 
          className="w-full justify-start mt-2 text-muted-foreground hover:text-foreground"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Invite teammates
        </Button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-2">
        {menuItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            className={`w-full justify-start mb-1 ${
              item.isActive ? 'bg-accent text-accent-foreground' : ''
            }`}
            onClick={() => navigate(item.path)}
          >
            <item.icon className="h-4 w-4 mr-2" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <Badge 
                variant={item.badge === 'New!' ? 'secondary' : 'default'}
                className={`ml-2 ${
                  item.badge === '2' ? 'bg-red-500' : ''
                }`}
              >
                {item.badge}
              </Badge>
            )}
          </Button>
        ))}
      </nav>
    </div>
  );
};