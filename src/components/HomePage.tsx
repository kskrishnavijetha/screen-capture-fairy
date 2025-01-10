import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { MENU_ITEMS } from "./MainMenu";

interface HomePageProps {
  setSelectedComponent: (id: string) => void;
}

export const HomePage = ({ setSelectedComponent }: HomePageProps) => {
  return (
    <div className="space-y-12 max-w-6xl mx-auto px-4">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold tracking-tight leading-tight">
          A Single Recording Can Tell the Whole Story
        </h1>
        <p className="text-lg text-muted-foreground">
          Easily create and share AI-enhanced video messages that tell the whole story and drive seamless collaboration
        </p>
      </div>

      <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 p-1">
        <div className="relative rounded-lg overflow-hidden aspect-video">
          <video 
            className="w-full h-full object-cover"
            autoPlay 
            loop 
            muted 
            playsInline
          >
            <source src="/lovable-uploads/54cd55ec-2ab7-464a-a5c9-7388b5f53a05.png" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Button 
              size="lg" 
              className="gap-2 text-lg hover:scale-105 transition-transform"
              onClick={() => setSelectedComponent('recorder')}
            >
              <Play className="w-5 h-5" />
              Start Recording
            </Button>
          </div>
        </div>

        <div className="absolute -z-10 inset-0 blur-3xl opacity-50 bg-gradient-to-br from-primary to-accent" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Easy Recording</CardTitle>
            <CardDescription>Start recording your screen with just one click</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Smart Editing</CardTitle>
            <CardDescription>Edit your recordings with AI-powered tools</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Instant Sharing</CardTitle>
            <CardDescription>Share your recordings instantly with anyone</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};