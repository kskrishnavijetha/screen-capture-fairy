import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Settings, LogOut } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

const UserPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/signin');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message
      });
    }
  };

  return (
    <div className="min-h-screen p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">User Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => navigate('/profile')}
          >
            <User className="mr-2 h-4 w-4" />
            Profile
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => navigate('/settings')}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-red-500 hover:text-red-600"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPage;