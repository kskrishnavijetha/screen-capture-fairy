import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthError, AuthApiError } from '@supabase/supabase-js';

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetRequestTime, setResetRequestTime] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication state when component mounts
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    
    checkAuth();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const getErrorMessage = (error: AuthError) => {
    if (error instanceof AuthApiError) {
      switch (error.message) {
        case "Invalid login credentials":
          return "The email or password you entered is incorrect. Please try again.";
        case "Email not confirmed":
          return "Please verify your email address before signing in.";
        case "Invalid email or password":
          return "Please check your email and password and try again.";
        default:
          return error.message;
      }
    }
    return error.message;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });
      
      if (error) throw error;
      
      // Navigation will be handled by the auth state change listener
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error signing in",
        description: getErrorMessage(error as AuthError)
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your email address"
      });
      return;
    }

    const now = Date.now();
    const timeSinceLastRequest = now - resetRequestTime;
    if (timeSinceLastRequest < 60000) {
      const remainingSeconds = Math.ceil((60000 - timeSinceLastRequest) / 1000);
      toast({
        variant: "destructive",
        title: "Please wait",
        description: `You can request another reset email in ${remainingSeconds} seconds.`
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) throw error;
      
      setResetRequestTime(now);
      
      toast({
        title: "Password reset email sent",
        description: "Check your email for the password reset link"
      });
    } catch (error) {
      const err = error as AuthError;
      if (err.message.includes('rate_limit')) {
        toast({
          variant: "destructive",
          title: "Too many requests",
          description: "Please wait a minute before requesting another password reset."
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex items-center">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold">Sign In</h2>
          <p className="text-muted-foreground mt-2">Welcome back! Please sign in to continue.</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <Button
                variant="link"
                type="button"
                className="px-0 font-normal"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </Button>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => navigate('/signup')}
          >
            Don't have an account? Sign up
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SignIn;