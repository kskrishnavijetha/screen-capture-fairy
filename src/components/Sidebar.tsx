import React, { useState } from 'react';
import { 
  Robot, 
  Video, 
  Monitor, 
  Calendar, 
  ChartBar, 
  DollarSign,
  Menu
} from 'lucide-react';
import { Button } from './ui/button';

const MENU_ITEMS = [
  { id: 'ai-content', label: 'AI Content Generator', icon: Robot },
  { id: 'ai-video', label: 'AI Short video Generator', icon: Video },
  { id: 'screen-recorder', label: 'Screen Recorder', icon: Monitor },
  { id: 'calendar', label: 'Content Calendar', icon: Calendar },
  { id: 'analytics', label: 'Social Media Analytics', icon: ChartBar },
  { id: 'monetization', label: 'Monetization Hub', icon: DollarSign },
];

export const Sidebar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleMenuItemClick = (itemId: string) => {
    setSelectedItem(itemId);
    setIsMenuOpen(false);
  };

  return (
    <div className="w-64 min-h-screen bg-[#1A1F2C] text-white p-6 flex flex-col">
      <div className="mb-12">
        <img 
          src="/lovable-uploads/fae7d82d-9e93-4fd2-b527-9f39bce9277a.png" 
          alt="Logo" 
          className="w-32"
        />
      </div>
      
      <div className="relative">
        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-white/10 mb-4"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="mr-2 h-4 w-4" />
          Menu
        </Button>

        {isMenuOpen && (
          <div className="absolute left-0 w-full bg-[#1A1F2C] border border-gray-700 rounded-md shadow-lg z-50">
            {MENU_ITEMS.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className="w-full justify-start text-white hover:bg-white/10"
                onClick={() => handleMenuItemClick(item.id)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {selectedItem && (
        <div className="mt-4">
          {selectedItem === 'screen-recorder' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Previous Recordings</h3>
              {/* This is where you would map through previous recordings */}
              <div className="bg-gray-800 p-3 rounded">
                <p className="text-sm">Recording 1 - 12/03/2024</p>
              </div>
              <div className="bg-gray-800 p-3 rounded">
                <p className="text-sm">Recording 2 - 11/03/2024</p>
              </div>
            </div>
          )}
          {/* Add other component content based on selectedItem */}
        </div>
      )}

      <div className="mt-auto pt-6 text-sm text-center text-gray-400">
        © 2024. All rights reserved
      </div>
    </div>
  );
};