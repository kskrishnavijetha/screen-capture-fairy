import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ChevronUp, Play } from "lucide-react";

interface HomePageProps {
  setSelectedComponent: (id: string) => void;
}

export const HomePage = ({ setSelectedComponent }: HomePageProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-8 w-full max-w-7xl mx-auto px-4">
      {/* Left Section - Getting Started */}
      <div className="flex-1 space-y-6">
        <div className="text-left">
          <h1 className="text-3xl font-bold mb-2">Start your recording journey</h1>
          <p className="text-muted-foreground">4 easy steps to becoming a recording pro</p>
        </div>

        <div className="space-y-4">
          {/* Download Step */}
          <Card className="p-4 cursor-pointer hover:bg-accent/5">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium">Download</span>
              <ChevronDown className="w-4 h-4 ml-auto" />
            </div>
          </Card>

          {/* Record Step */}
          <Card className="p-4 cursor-pointer hover:bg-accent/5">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium">Record</span>
              <ChevronDown className="w-4 h-4 ml-auto" />
            </div>
          </Card>

          {/* Share Step */}
          <Card className="p-4 cursor-pointer hover:bg-accent/5">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium">Share</span>
              <ChevronDown className="w-4 h-4 ml-auto" />
            </div>
          </Card>

          {/* Invite Step */}
          <Card className="p-4 cursor-pointer hover:bg-accent/5">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">
                <span className="text-sm">4</span>
              </div>
              <span className="font-medium">Invite</span>
              <ChevronUp className="w-4 h-4 ml-auto" />
            </div>
            <div className="mt-4 pl-9">
              <p className="text-sm text-muted-foreground mb-3">
                Recording is better when you know who you're working with. Invite your team for free!
              </p>
              <Button 
                variant="outline" 
                className="w-full justify-center"
                onClick={() => setSelectedComponent('invite')}
              >
                Invite teammates
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Right Section - Demo Video */}
      <div className="flex-1 space-y-6">
        <div className="text-left">
          <h2 className="text-3xl font-bold mb-2">Share your recording</h2>
          <p className="text-muted-foreground">Easily copy the link or send your recording in an email</p>
        </div>

        <Card className="overflow-hidden">
          <div className="relative aspect-video bg-black">
            <video
              className="w-full h-full object-cover"
              src="/lovable-uploads/ce6c9243-fc98-4489-b41c-10e4ed0d6ef3.png"
              poster="/lovable-uploads/ce6c9243-fc98-4489-b41c-10e4ed0d6ef3.png"
              controls
              muted
            >
              Your browser does not support the video element.
            </video>
            <div className="absolute inset-0 flex items-center justify-center">
              <Button 
                size="icon" 
                variant="secondary" 
                className="w-16 h-16 rounded-full"
                onClick={() => setSelectedComponent('recorder')}
              >
                <Play className="w-8 h-8" />
              </Button>
            </div>
          </div>
          <div className="p-4 space-y-2">
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={() => setSelectedComponent('edit')}
            >
              Edit video
            </Button>
            <Button 
              className="w-full"
              onClick={() => setSelectedComponent('share')}
            >
              Share video
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};