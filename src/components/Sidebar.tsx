import React from 'react';
import { Home, FileText, Video, MonitorPlay, Calendar, ChartBar, DollarSign } from 'lucide-react';
import { Button } from './ui/button';

const MENU_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'about', label: 'About', icon: FileText },
  { id: 'blog', label: 'Blog', icon: Video },
  { id: 'pages', label: 'Pages', icon: MonitorPlay },
  { id: 'team', label: 'Team', icon: Calendar },
  { id: 'contact', label: 'Contact Us', icon: ChartBar },
];

export const Sidebar = () => {
  return (
    <div className="w-64 min-h-screen bg-[#1A1F2C] text-white p-6 flex flex-col">
      <div className="mb-12">
        <img 
          src="/lovable-uploads/fae7d82d-9e93-4fd2-b527-9f39bce9277a.png" 
          alt="Logo" 
          className="w-32"
        />
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-4">
          {MENU_ITEMS.map((item) => (
            <li key={item.id}>
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-white/10"
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto pt-6 text-sm text-center text-gray-400">
        © 2024. All rights reserved
      </div>
    </div>
  );
};