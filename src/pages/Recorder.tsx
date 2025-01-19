import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Recorder = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1a1f2c] p-4">
      <div className="max-w-4xl mx-auto text-center space-y-8 pt-20">
        <h1 className="text-5xl font-bold text-white tracking-tight">
          Record Your Screen Anywhere, Anytime
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Easily capture your screen directly from your browser—no downloads or installations required. 
          Whether you're creating tutorials, recording meetings, or sharing gameplay, our free screen 
          recorder is fast, secure, and hassle-free. Start recording in just one click!
        </p>
        <div className="flex justify-center gap-4 mt-8">
          <Button 
            size="lg" 
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-8"
            onClick={() => navigate('/signin')}
          >
            Start Recording Now
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-white border-white/20 hover:bg-white/10"
            onClick={() => navigate('/signup')}
          >
            Create Free Account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Recorder;