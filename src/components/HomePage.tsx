import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface HomePageProps {
  setSelectedComponent: (id: string) => void;
  onSignUp: (email: string) => Promise<void>;
}

export const HomePage = ({ setSelectedComponent, onSignUp }: HomePageProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-12 max-w-4xl mx-auto px-4">
      <div className="text-center space-y-8 animate-fade-in">
        <h1 className="text-6xl font-bold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
          Record Your Screen Anywhere, Anytime
        </h1>
        <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
          Easily capture your screen directly from your browser—no downloads or installations required. 
          Whether you're creating tutorials, recording meetings, or sharing gameplay, our free screen 
          recorder is fast, secure, and hassle-free.
        </p>
        <div className="flex justify-center gap-4 mt-8">
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-white/90 transition-all duration-300 transform hover:scale-105"
            onClick={() => navigate('/signin')}
          >
            Start Recording Now
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-white/20 text-white hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
            onClick={() => navigate('/signup')}
          >
            Create Free Account
          </Button>
        </div>
      </div>
    </div>
  );
};