import React from 'react';
import { Button } from "@/components/ui/button";
import { User, Settings, LogOut } from 'lucide-react';

interface ProfileActionsProps {
  onNavigate: (path: string) => void;
  onSignOut: () => void;
}

export const ProfileActions = ({ onNavigate, onSignOut }: ProfileActionsProps) => {
  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => onNavigate('/profile')}
      >
        <User className="mr-2 h-4 w-4" />
        Edit Profile
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => onNavigate('/settings')}
      >
        <Settings className="mr-2 h-4 w-4" />
        Settings
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start text-red-500 hover:text-red-600"
        onClick={onSignOut}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
};