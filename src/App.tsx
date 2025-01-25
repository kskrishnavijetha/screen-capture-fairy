import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import SignIn from '@/pages/SignIn';
import SignUp from '@/pages/SignUp';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import VideoEdit from '@/pages/VideoEdit';
import VideoPlayback from '@/pages/VideoPlayback';
import UserPage from '@/pages/UserPage';
import LibraryPage from '@/pages/LibraryPage';
import { supabase } from './integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { UserPresence } from '@/components/UserPresence';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

// Create a client
const queryClient = new QueryClient();

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/signin" element={!session ? <SignIn /> : <Navigate to="/" />} />
            <Route path="/signup" element={!session ? <SignUp /> : <Navigate to="/" />} />
            <Route
              path="/*"
              element={
                session ? (
                  <ProtectedLayout session={session}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/library" element={<LibraryPage />} />
                      <Route path="/edit" element={<VideoEdit />} />
                      <Route path="/playback" element={<VideoPlayback />} />
                      <Route path="/profile" element={<UserPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </ProtectedLayout>
                ) : (
                  <Navigate to="/signin" />
                )
              }
            />
          </Routes>
          <Toaster />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const ProtectedLayout = ({ session, children }: { session: Session; children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1">
          <div className="absolute top-4 right-4">
            <UserPresence user={session.user} />
          </div>
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default App;