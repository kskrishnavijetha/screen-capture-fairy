import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Library,
  Calendar,
  Bell,
  Bookmark,
  Clock,
  Gift,
  Settings,
  Users,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from '@/integrations/supabase/client';

export const SideNavigation = () => {
  const navigate = useNavigate();
  const [notifications] = React.useState(2); // Example notification count
  const [userName, setUserName] = React.useState('');

  React.useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();
        
        if (profile?.name) {
          setUserName(profile.name);
        }
      }
    };
    
    getProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/signin');
  };

  return (
    <div className="w-64 h-screen bg-[#1B1B1B] text-white p-4 flex flex-col">
      {/* Workspace Header */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between text-white hover:bg-white/10 mb-4"
          >
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{userName}'s Workspace</span>
              <span className="text-xs text-gray-400">1 member</span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuItem onClick={handleSignOut}>
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Invite Button */}
      <Button 
        variant="ghost" 
        className="w-full justify-start text-white hover:bg-white/10 mb-6"
        onClick={() => navigate('/invite')}
      >
        <Users className="h-4 w-4 mr-2" />
        Invite teammates
      </Button>

      {/* Navigation Items */}
      <nav className="space-y-1">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-white hover:bg-white/10"
          onClick={() => navigate('/')}
        >
          <Home className="h-4 w-4 mr-2" />
          Home
        </Button>

        <Button 
          variant="ghost" 
          className="w-full justify-start text-white hover:bg-white/10 bg-white/5"
        >
          <Library className="h-4 w-4 mr-2" />
          My Library
        </Button>

        <Button 
          variant="ghost" 
          className="w-full justify-start text-white hover:bg-white/10"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Meetings
          <Badge className="ml-2 bg-blue-500 text-[10px]">Beta</Badge>
        </Button>

        <Button 
          variant="ghost" 
          className="w-full justify-start text-white hover:bg-white/10"
        >
          <Bell className="h-4 w-4 mr-2" />
          Notifications
          {notifications > 0 && (
            <Badge className="ml-2 bg-red-500">{notifications}</Badge>
          )}
        </Button>

        <Button 
          variant="ghost" 
          className="w-full justify-start text-white hover:bg-white/10"
        >
          <Bookmark className="h-4 w-4 mr-2" />
          Watch Later
        </Button>

        <Button 
          variant="ghost" 
          className="w-full justify-start text-white hover:bg-white/10"
        >
          <Clock className="h-4 w-4 mr-2" />
          History
        </Button>

        <Button 
          variant="ghost" 
          className="w-full justify-start text-white hover:bg-white/10"
        >
          <Gift className="h-4 w-4 mr-2" />
          Earn free videos
          <Badge className="ml-2 bg-blue-100 text-blue-600 text-[10px]">New!</Badge>
        </Button>

        <Button 
          variant="ghost" 
          className="w-full justify-start text-white hover:bg-white/10"
          onClick={() => navigate('/settings')}
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </nav>
    </div>
  );
};