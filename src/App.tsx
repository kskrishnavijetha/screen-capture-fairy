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
import Recorder from "./pages/Recorder";
import { supabase } from './integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

const queryClient = new QueryClient();

// Protected Route component with persistent auth check
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Show loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Redirect if not authenticated
  if (!session) {
    // Store the attempted URL to redirect back after login
    sessionStorage.setItem('redirectUrl', window.location.pathname);
    return <Navigate to="/signin" replace />;
  }

  return children;
};

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/user" element={<ProtectedRoute><UserPage /></ProtectedRoute>} />
            <Route path="/recorder" element={<Recorder />} />
            <Route path="/record" element={<ProtectedRoute><RecordingComponent /></ProtectedRoute>} />
            <Route path="/safeshare" element={<ProtectedRoute><SafeShareComponent /></ProtectedRoute>} />
            <Route path="/playback" element={<ProtectedRoute><VideoPlayback /></ProtectedRoute>} />
            <Route path="/edit" element={<ProtectedRoute><VideoEdit /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;