import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import VideoPlayback from "./pages/VideoPlayback";
import VideoEdit from "./pages/VideoEdit";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import UserPage from "./pages/UserPage";
import NotFound from "./pages/NotFound";
import { RecordingComponent } from "@/components/RecordingComponent";
import { SafeShareComponent } from "@/components/SafeShareComponent";
import { supabase } from './integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { UserPresence } from '@/components/UserPresence';
import { SideNavigation } from '@/components/SideNavigation';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <div className="flex">
      <SideNavigation />
      <div className="flex-1">
        <div className="absolute top-4 right-4">
          <UserPresence user={session.user} />
        </div>
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/user" element={<ProtectedRoute><UserPage /></ProtectedRoute>} />
            <Route path="/recorder" element={<ProtectedRoute><RecordingComponent /></ProtectedRoute>} />
            <Route path="/safeshare" element={<ProtectedRoute><SafeShareComponent /></ProtectedRoute>} />
            <Route path="/playback" element={<ProtectedRoute><VideoPlayback /></ProtectedRoute>} />
            <Route path="/edit" element={<ProtectedRoute><VideoEdit /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default function AppWrapper() {
  return (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}