import React from 'react';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { supabase } from '../integrations/supabase/client';

const UserPage = () => {
  const [userName, setUserName] = React.useState<string>('');

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserName(user.email.split('@')[0] + "'s Workspace");
      }
    };
    getUser();
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userName={userName} />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold">Welcome to your workspace</h1>
      </main>
    </div>
  );
};

export default UserPage;