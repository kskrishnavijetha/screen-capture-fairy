import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface HomePageProps {
  setSelectedComponent: (id: string) => void;
  onSignUp: (email: string) => Promise<void>;
}

export const HomePage = ({ setSelectedComponent }: HomePageProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-12 max-w-4xl mx-auto px-4">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight leading-tight">
          Record Your Screen Anywhere, Anytime
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Easily capture your screen directly from your browser—no downloads or installations required. Whether you're creating tutorials, recording meetings, or sharing gameplay, our free screen recorder is fast, secure, and hassle-free. Start recording in just one click!
        </p>
        <div className="flex justify-center gap-4 mt-8">
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90"
            onClick={() => navigate('/recorder')}
          >
            Start Recording Now
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => navigate('/safeshare')}
          >
            SafeShare
          </Button>
        </div>
      </div>
    </div>
  );
};