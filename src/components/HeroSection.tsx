import React from 'react';

export const HeroSection = () => {
  return (
    <div className="text-center space-y-6 max-w-3xl mx-auto mb-12">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent whitespace-nowrap overflow-x-auto">
        One video is worth a thousand words
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
        Easily record and share AI-powered video messages with your
        <br className="hidden sm:block" />
        teammates and customers to supercharge productivity
      </p>
    </div>
  );
};