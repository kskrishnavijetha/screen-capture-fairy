import React from 'react';

const HeroSection = () => {
  return (
    <section className="min-h-screen pt-24 px-4 bg-[#E0E0F8]">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-[#1A1F2C] mb-6 leading-tight">
          One video is worth a thousand words
        </h1>
        <p className="text-lg md:text-xl text-[#1A1F2C]/80 max-w-2xl mx-auto leading-relaxed">
          Easily record and share AI-powered video messages with your<br className="hidden md:block" />
          teammates and customers to supercharge productivity
        </p>
      </div>
    </section>
  );
};

export default HeroSection;