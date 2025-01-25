import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Menu, Home, Library, Calendar, Bell, Bookmark, Clock, Gift, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthError, AuthApiError } from '@supabase/supabase-js';

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [stayConnected, setStayConnected] = useState(false);
  const [resetRequestTime, setResetRequestTime] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/recorder');
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        navigate('/recorder');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });
      
      if (error) throw error;
      
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

  const getErrorMessage = (error: AuthError) => {
    if (error instanceof AuthApiError) {
      switch (error.message) {
        case "Invalid login credentials":
          return 'Invalid email or password. Please check your credentials and try again.';
        case "Email not confirmed":
          return 'Please check your email for the confirmation link.';
        case "Invalid email or password":
          return 'Please check your email and password and try again.';
        default:
          return error.message;
      }
    }
    return error.message;
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <div className="w-64 bg-[#1B1B1B] text-white p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <img 
            src="/lovable-uploads/d61c7c4e-e7ad-4177-bfd9-c819f5de7986.png"
            alt="ScreenCraft Logo"
            className="w-8 h-8"
          />
          <span className="text-lg font-semibold">Softwave</span>
        </div>

        <nav className="space-y-2">
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
            className="w-full justify-start text-white hover:bg-white/10"
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
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-white/10"
          >
            <Bell className="h-4 w-4 mr-2" />
            Notifications
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
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-white/10"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Sign in to continue recording and sharing</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10"
                autoComplete="email"
                inputMode="email"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Button
                  variant="link"
                  type="button"
                  className="px-0 h-auto font-normal text-sm"
                  onClick={() => {
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

                    supabase.auth.resetPasswordForEmail(email.trim())
                      .then(({ error }) => {
                        if (error) throw error;
                        setResetRequestTime(now);
                        toast({
                          title: "Password reset email sent",
                          description: "Check your email for the password reset link"
                        });
                      })
                      .catch((error) => {
                        if (error.message.includes('rate_limit')) {
                          toast({
                            variant: "destructive",
                            title: "Too many requests",
                            description: "Please wait a minute before requesting another password reset."
                          });
                        } else {
                          toast({
                            variant: "destructive",
                            title: "Error",
                            description: error.message
                          });
                        }
                      });
                  }}
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
                className="h-10"
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="stayConnected"
                checked={stayConnected}
                onCheckedChange={(checked) => setStayConnected(checked as boolean)}
              />
              <Label
                htmlFor="stayConnected"
                className="text-sm font-normal cursor-pointer"
              >
                Stay connected
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full h-10"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => navigate('/signup')}
              className="text-sm"
            >
              Don't have an account? Sign up
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;