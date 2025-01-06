import React from 'react';
import { Button } from './ui/button';

export const HeroSection = () => {
  return (
    <div className="flex-1 bg-[#D3E4FD] p-12">
      <div className="max-w-2xl">
        <h1 className="text-5xl font-bold text-[#1A1F2C] mb-6">
          Insuring Your Future From Today
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          From banking and insurance to wealth management and securities distribution, 
          we dedicated financial services the teams serve all major sectors.
        </p>
        <div className="flex gap-4">
          <Button className="bg-blue-600 hover:bg-blue-700">
            WORK WITH US
          </Button>
          <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
            LEARN MORE
          </Button>
        </div>
      </div>
    </div>
  );
};