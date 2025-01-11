import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface SignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SignInDialog = ({ open, onOpenChange }: SignInDialogProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      if (password !== confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive",
        });
        return;
      }
      try {
        console.log("Signing up with:", { name, email, password });
        toast({
          title: "Account created",
          description: "Welcome to our platform!",
        });
        onOpenChange(false);
        navigate('/recorder');
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create account. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      try {
        console.log("Logging in with:", { email, password });
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        onOpenChange(false);
        navigate('/recorder');
      } catch (error) {
        toast({
          title: "Login Failed",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-6 bg-white rounded-lg">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">
              {isSignUp ? "Join us today!" : "Welcome back!"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isSignUp ? "Sign up now to become a member." : "Log in to access your account."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <Input
                placeholder="Enter Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <Input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder={isSignUp ? "Choose A Password" : "Enter Your Password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {isSignUp && (
              <Input
                type="password"
                placeholder="Re-Enter Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            )}
            <Button type="submit" className="w-full bg-[#6C5CE7] hover:bg-[#5A4ED1]">
              {isSignUp ? "Signup" : "Login"}
            </Button>
          </form>

          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[#6C5CE7] hover:underline"
            >
              {isSignUp ? "Already a member? Login Here" : "Not a member? Signup Here"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};