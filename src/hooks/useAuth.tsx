
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthError, AuthApiError } from '@supabase/supabase-js';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [resetRequestTime, setResetRequestTime] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const signIn = async (email: string, password: string) => {
    if (!email.trim() || !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter both email and password"
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      
      if (error) {
        throw error;
      }

      if (data?.session) {
        toast({
          title: "Success",
          description: "Successfully signed in!",
        });
        navigate('/recorder');
      } else {
        throw new Error('No session created');
      }
      
    } catch (error) {
      const err = error as AuthError;
      let errorMessage = "An error occurred while signing in. Please try again.";
      
      if (err instanceof AuthApiError) {
        switch (err.status) {
          case 400:
            errorMessage = "Invalid email or password";
            break;
          case 422:
            errorMessage = "Invalid email format";
            break;
          case 429:
            errorMessage = "Too many attempts. Please try again later";
            break;
          default:
            errorMessage = err.message;
        }
      }
      
      toast({
        variant: "destructive",
        title: "Error signing in",
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
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

  return {
    loading,
    signIn,
    handleForgotPassword,
  };
};
