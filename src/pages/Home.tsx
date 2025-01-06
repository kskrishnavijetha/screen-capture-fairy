import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Video, MonitorPlay, Calendar, ChartBar, DollarSign } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const FEATURES = [
  {
    id: 'content',
    label: 'AI Content Generator',
    icon: FileText,
    description: 'Generate engaging content with AI assistance',
    path: '/'
  },
  {
    id: 'video',
    label: 'AI Short Video Generator',
    icon: Video,
    description: 'Create compelling short-form videos using AI',
    path: '/'
  },
  {
    id: 'recorder',
    label: 'Screen Recorder',
    icon: MonitorPlay,
    description: 'Record your screen with professional tools',
    path: '/'
  },
  {
    id: 'calendar',
    label: 'Content Calendar',
    icon: Calendar,
    description: 'Plan and schedule your content effectively',
    path: '/'
  },
  {
    id: 'analytics',
    label: 'Social Media Analytics',
    icon: ChartBar,
    description: 'Track and analyze your social media performance',
    path: '/'
  },
  {
    id: 'monetization',
    label: 'Monetization Hub',
    icon: DollarSign,
    description: 'Optimize your content for revenue generation',
    path: '/'
  }
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to ScreenCraft Fairy</h1>
        <p className="text-xl text-muted-foreground">
          Your all-in-one platform for screen recording and content creation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((feature) => (
          <Card 
            key={feature.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(feature.path)}
          >
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <feature.icon className="h-6 w-6 text-primary" />
                <CardTitle>{feature.label}</CardTitle>
              </div>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Home;