import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignIn } from "./SignIn";

interface HomePageProps {
  setSelectedComponent: (id: string) => void;
}

export const HomePage = ({ setSelectedComponent }: HomePageProps) => {
  const [showSignIn, setShowSignIn] = useState(false);

  if (showSignIn) {
    return (
      <div className="max-w-screen-xl mx-auto px-4">
        <SignIn />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end mb-4">
        <Button 
          variant="default" 
          onClick={() => setShowSignIn(true)}
          className="bg-primary hover:bg-primary/90"
        >
          Sign In
        </Button>
      </div>
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold tracking-tight leading-tight">
          A Single Recording Can Tell the Whole Story
        </h1>
        <p className="text-lg text-muted-foreground">
          Easily create and share AI-enhanced video messages that tell the whole story and drive seamless collaboration
        </p>
      </div>
    </div>
  );
};