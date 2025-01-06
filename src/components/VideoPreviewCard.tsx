import React from 'react';
import { Play } from 'lucide-react';
import { Card } from './ui/card';

export const VideoPreviewCard = () => {
  return (
    <Card className="relative w-full max-w-2xl mx-auto mt-8 overflow-hidden rounded-2xl shadow-lg">
      <div className="relative aspect-video bg-gradient-to-br from-purple-100 to-blue-50">
        <img
          src="/lovable-uploads/3308e028-c9fc-4616-9676-f7454fc5d8ef.png"
          alt="Video preview showing a person recording their screen"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 cursor-pointer hover:bg-white transition-colors">
            <Play className="w-8 h-8 text-primary" />
          </div>
        </div>
      </div>
    </Card>
  );
};