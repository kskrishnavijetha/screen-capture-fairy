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
        <p className="text-xl text-muted-foreground">
          Where seamless digital experiences come to life. Whether you're connecting with your audience, 
          managing virtual events, or sharing your creative ideas, Softwave.Live empowers you with 
          intuitive tools to make every interaction meaningful.
        </p>
        
        <div className="mt-12 space-y-8">
          <h2 className="text-2xl font-semibold">Our platform is designed to help you:</h2>
          
          <ul className="space-y-4 text-lg text-muted-foreground">
            <li className="space-y-1">
              <strong className="text-foreground">Stream effortlessly:</strong>
              <p>High-quality, reliable live streaming with customizable settings to match your style.</p>
            </li>
            <li className="space-y-1">
              <strong className="text-foreground">Engage your audience:</strong>
              <p>Interactive features like polls, Q&A, and live chat for deeper connections.</p>
            </li>
            <li className="space-y-1">
              <strong className="text-foreground">Collaborate in real-time:</strong>
              <p>Share ideas, screens, and updates with your team or community seamlessly.</p>
            </li>
            <li className="space-y-1">
              <strong className="text-foreground">Analyze performance:</strong>
              <p>Insights and analytics to help you optimize your content and grow your reach.</p>
            </li>
          </ul>

          <p className="text-lg text-muted-foreground">
            Whether you're an educator, creator, or business professional, Softwave.Live offers 
            the perfect blend of simplicity and sophistication to elevate your digital presence.
          </p>

          <p className="text-xl font-medium">
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