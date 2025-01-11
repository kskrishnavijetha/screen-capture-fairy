import { Button } from "@/components/ui/button";
import { useState } from "react";
import { SignInDialog } from "./auth/SignInDialog";

interface HomePageProps {
  setSelectedComponent: (id: string) => void;
}

export const HomePage = ({ setSelectedComponent }: HomePageProps) => {
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold tracking-tight leading-tight">
          A Single Recording Can Tell the Whole Story
        </h1>
        <p className="text-lg text-muted-foreground">
          Easily create and share AI-enhanced video messages that tell the whole
          story and drive seamless collaboration
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Button 
            size="lg" 
            onClick={() => setShowSignIn(true)}
            className="h-12 px-8 text-base font-medium"
          >
            Sign up for free
          </Button>
        </div>
      </div>

      <SignInDialog open={showSignIn} onOpenChange={setShowSignIn} />
    </div>
  );
};