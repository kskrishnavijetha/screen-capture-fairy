import React from 'react';
import { FileText, Video, MonitorPlay } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-2rem)] bg-background text-foreground p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to Technova</h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl text-center">
        Your all-in-one platform for content creation, screen recording, and social media management
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
        {/* Feature cards */}
        <div className="p-6 bg-card rounded-lg shadow-lg">
          <FileText className="h-8 w-8 mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">AI Content Generator</h3>
          <p className="text-muted-foreground">Create engaging content with the power of AI</p>
        </div>
        <div className="p-6 bg-card rounded-lg shadow-lg">
          <Video className="h-8 w-8 mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">Video Generator</h3>
          <p className="text-muted-foreground">Generate short-form videos automatically</p>
        </div>
        <div className="p-6 bg-card rounded-lg shadow-lg">
          <MonitorPlay className="h-8 w-8 mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">Screen Recorder</h3>
          <p className="text-muted-foreground">Record your screen with professional tools</p>
        </div>
      </div>
    </div>
  );
}
