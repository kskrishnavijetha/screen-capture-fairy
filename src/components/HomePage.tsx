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
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight leading-tight">
          Welcome to Softwave.Live
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Where seamless digital experiences come to life. Whether you're connecting with your audience, managing virtual events, or sharing your creative ideas, Softwave.Live empowers you with intuitive tools to make every interaction meaningful.
        </p>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4 p-6 rounded-lg bg-card hover:bg-card/80 transition-colors">
            <h3 className="text-xl font-semibold">Stream effortlessly</h3>
            <p className="text-muted-foreground">High-quality, reliable live streaming with customizable settings to match your style.</p>
          </div>
          
          <div className="space-y-4 p-6 rounded-lg bg-card hover:bg-card/80 transition-colors">
            <h3 className="text-xl font-semibold">Engage your audience</h3>
            <p className="text-muted-foreground">Interactive features like polls, Q&A, and live chat for deeper connections.</p>
          </div>
          
          <div className="space-y-4 p-6 rounded-lg bg-card hover:bg-card/80 transition-colors">
            <h3 className="text-xl font-semibold">Collaborate in real-time</h3>
            <p className="text-muted-foreground">Share ideas, screens, and updates with your team or community seamlessly.</p>
          </div>
          
          <div className="space-y-4 p-6 rounded-lg bg-card hover:bg-card/80 transition-colors">
            <h3 className="text-xl font-semibold">Analyze performance</h3>
            <p className="text-muted-foreground">Insights and analytics to help you optimize your content and grow your reach.</p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <p className="text-lg text-muted-foreground">
            Whether you're an educator, creator, or business professional, Softwave.Live offers the perfect blend of simplicity and sophistication to elevate your digital presence.
          </p>
          
          <p className="text-lg font-medium">
            Let's create unforgettable experiences together. Start your journey with Softwave.Live today!
          </p>
          
          <div className="flex justify-center gap-4 mt-8">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90"
              onClick={() => navigate('/signin')}
            >
              Start Recording Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate('/signup')}
            >
              Create Free Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};