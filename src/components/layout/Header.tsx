import React from 'react';
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm z-50">
      <div className="flex items-center gap-4">
        <img 
          src="/lovable-uploads/fae7d82d-9e93-4fd2-b527-9f39bce9277a.png" 
          alt="Technova Logo" 
          className="w-10 h-10 object-contain"
        />
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost">Sign In</Button>
        <Button>Get Started Free</Button>
        <Button variant="outline">Contact Sales</Button>
      </div>
    </header>
  );
};

export default Header;