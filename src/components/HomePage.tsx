import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface HomePageProps {
  setSelectedComponent: (id: string) => void;
  onSignUp: (email: string) => Promise<void>;
}

export const HomePage = ({ setSelectedComponent, onSignUp }: HomePageProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold tracking-tight leading-tight">
          A Single Recording Can Tell the Whole Story
        </h1>
        <p className="text-lg text-muted-foreground">
          Easily create and share AI-enhanced video messages that tell the whole story and drive seamless collaboration
        </p>
        <div className="flex justify-center gap-4 mt-8">
          <Button size="lg" onClick={() => navigate('/signin')}>
            Sign In
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/signup')}>
            Sign Up Free
          </Button>
        </div>
      </div>
    </div>
  );
};