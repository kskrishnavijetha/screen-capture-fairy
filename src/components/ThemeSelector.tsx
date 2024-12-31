import React from 'react';
import { Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const themes = [
  { name: 'Default Dark', bg: 'bg-[#1A1F2C]', accent: 'bg-[#9b87f5]' },
  { name: 'Ocean', bg: 'bg-[#222222]', accent: 'bg-[#0EA5E9]' },
  { name: 'Forest', bg: 'bg-[#221F26]', accent: 'bg-[#22C55E]' },
  { name: 'Sunset', bg: 'bg-[#403E43]', accent: 'bg-[#F97316]' },
  { name: 'Berry', bg: 'bg-[#1A1F2C]', accent: 'bg-[#D946EF]' }
];

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

export const ThemeSelector = ({ currentTheme, onThemeChange }: ThemeSelectorProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[180px] justify-between">
          <span>Theme: {currentTheme}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[180px]">
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.name}
            className="flex items-center justify-between cursor-pointer"
            onClick={() => onThemeChange(theme.name)}
          >
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${theme.bg}`} />
              <span>{theme.name}</span>
            </div>
            {currentTheme === theme.name && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};