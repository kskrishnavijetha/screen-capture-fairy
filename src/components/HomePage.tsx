import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface HomePageProps {
  setSelectedComponent: (id: string) => void;
}

export const HomePage = ({ setSelectedComponent }: HomePageProps) => {
  return (
    <div className="space-y-16 max-w-5xl mx-auto px-4">
      <div className="text-center space-y-6">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
          One video is worth a thousand words
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Easily record and share AI-powered video messages with your teammates and customers to supercharge productivity
        </p>
        <div className="flex gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90"
            onClick={() => setSelectedComponent('recorder')}
          >
            Start Recording
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10"
          >
            Install Chrome Extension
          </Button>
        </div>
      </div>

      <div className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
        <img 
          src="/lovable-uploads/fbf0a41b-c865-4fde-823c-8c8cbfceb6d6.png" 
          alt="Video Preview" 
          className="w-full"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Button 
            size="lg"
            className="rounded-full w-16 h-16 bg-primary hover:bg-primary/90"
            onClick={() => setSelectedComponent('recorder')}
          >
            <Play className="h-8 w-8" />
          </Button>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">
          More than 25 million people across 400,000
        </h2>
        <p className="text-2xl font-semibold text-primary">
          companies choose Loom
        </p>
      </div>
    </div>
  );
};