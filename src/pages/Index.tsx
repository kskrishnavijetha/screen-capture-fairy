import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { HeroSection } from '@/components/HeroSection';

const Index = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <HeroSection />
    </div>
  );
};

export default Index;