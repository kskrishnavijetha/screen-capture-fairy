
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";

export const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [stayConnected, setStayConnected] = useState(false);
  const { loading, signIn, handleForgotPassword } = useAuth();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signIn(email, password);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-10 px-3 rounded-md"
          autoComplete="email"
          inputMode="email"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <Button
            variant="link"
            type="button"
            className="px-0 h-auto font-normal text-sm"
            onClick={() => handleForgotPassword(email)}
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
          className="h-10 px-3 rounded-md"
          autoComplete="current-password"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="stayConnected"
          checked={stayConnected}
          onCheckedChange={(checked) => setStayConnected(checked as boolean)}
          className="rounded"
        />
        <Label
          htmlFor="stayConnected"
          className="text-sm font-normal cursor-pointer select-none"
        >
          Stay connected
        </Label>
      </div>

      <Button
        type="submit"
        className="w-full h-10 rounded-md"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
};
