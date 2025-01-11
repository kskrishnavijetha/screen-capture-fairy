import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SignInDialog = ({ open, onOpenChange }: SignInDialogProps) => {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Please check your email to verify your account.",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully logged in",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-6 bg-white rounded-3xl">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold tracking-tight">
              {isLogin ? "Welcome back!" : "Join us today!"}
            </h2>
            <p className="text-sm text-gray-500">
              {isLogin ? "Log in to access your account." : "Sign up now to become a member."}
            </p>
          </div>

          <form onSubmit={isLogin ? handleLogin : handleSignUp} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Input
                  placeholder="Enter Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12"
                  disabled={isLoading}
                />
              </div>
            )}
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder={isLogin ? "Enter Your Password" : "Choose A Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12"
                disabled={isLoading}
              />
            </div>
            {!isLogin && (
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Re-Enter Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12"
                  disabled={isLoading}
                />
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full h-12 bg-[#6C63FF] hover:bg-[#5B52E5] text-white font-medium text-base"
              disabled={isLoading}
            >
              {isLogin ? "Login" : "Signup"}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-gray-500">
              {isLogin ? "Not a member? " : "Already a member? "}
            </span>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#6C63FF] hover:underline font-medium"
            >
              {isLogin ? "Signup Here" : "Login Here"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};