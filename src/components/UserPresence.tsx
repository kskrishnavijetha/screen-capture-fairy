import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

interface UserPresenceProps {
  user: User | null;
}

export const UserPresence = ({ user }: UserPresenceProps) => {
  const { toast } = useToast();
  const [onlineUsers, setOnlineUsers] = useState<number>(0);

  useEffect(() => {
    if (!user) return;

    // Create a presence channel
    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    // Handle presence state changes
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setOnlineUsers(Object.keys(state).length);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        console.log('User joined:', key);
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        console.log('User left:', key);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const status = await channel.track({
            online_at: new Date().toISOString(),
            user_id: user.id,
            email: user.email
          });

          if (status === 'ok') {
            toast({
              title: "Connected",
              description: "You are now connected to the presence system",
            });
          }
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [user, toast]);

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="bg-[#D3E4FD] text-[#0EA5E9] border-[#0EA5E9]">
        {onlineUsers} online
      </Badge>
    </div>
  );
};