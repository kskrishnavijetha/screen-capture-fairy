import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    };
    setIsMobile(checkMobile());

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      if (session) {
        // Handle redirection based on platform
        if (isMobile) {
          // On mobile, just navigate to the recorder page
          navigate('/recorder');
        } else {
          try {
            // Try to open in new tab
            const newWindow = window.open('/recorder', '_blank');
            if (newWindow) {
              window.close();
            } else {
              // If popup blocked, fallback to regular navigation
              navigate('/recorder');
            }
          } catch (error) {
            // Fallback for any errors
            navigate('/recorder');
          }
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        if (isMobile) {
          navigate('/recorder');
        } else {
          try {
            const newWindow = window.open('/recorder', '_blank');
            if (newWindow) {
              window.close();
            } else {
              navigate('/recorder');
            }
          } catch (error) {
            navigate('/recorder');
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, isMobile]);

  const handleSignUp = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/recorder`,
        },
      });

      if (error) throw error;

      toast({
        title: "Check your email",
        description: "We sent you a login link. Be sure to check your spam folder.",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while sending the login link.",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSignUp(email);
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            ScreenCraft Fairy ✨
          </CardTitle>
          <CardDescription className="text-center">
            Capture your screen with magic
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Get Magic Link
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          No account needed - just enter your email
        </CardFooter>
      </Card>
    </div>
  );
};

export default Index;