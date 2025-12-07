"use client";

import { Settings, Moon, Sun, Monitor, Minimize2, Maximize2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';

export type AnswerStyle = 'concise' | 'detailed';
export type ThemeMode = 'light' | 'dark' | 'system';

interface SettingsMenuProps {
  answerStyle: AnswerStyle;
  onAnswerStyleChange: (style: AnswerStyle) => void;
}

export default function SettingsMenu({ answerStyle, onAnswerStyleChange }: SettingsMenuProps) {
  const [theme, setTheme] = useState<ThemeMode>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
    const savedAnswerStyle = localStorage.getItem('answerStyle') as AnswerStyle | null;
    
    if (savedTheme) {
      setTheme(savedTheme);
    }
    
    if (savedAnswerStyle) {
      onAnswerStyleChange(savedAnswerStyle);
    }
    
    applyTheme(savedTheme || 'system');
  }, [onAnswerStyleChange]);

  const applyTheme = (newTheme: ThemeMode) => {
    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
  };

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const handleAnswerStyleChange = (newStyle: AnswerStyle) => {
    onAnswerStyleChange(newStyle);
    localStorage.setItem('answerStyle', newStyle);
  };

  if (!mounted) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Theme
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={(value) => handleThemeChange(value as ThemeMode)}>
          <DropdownMenuRadioItem value="light" className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark" className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Answer Length
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup value={answerStyle} onValueChange={(value) => handleAnswerStyleChange(value as AnswerStyle)}>
          <DropdownMenuRadioItem value="concise" className="flex items-center gap-2">
            <Minimize2 className="h-4 w-4" />
            Concise
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="detailed" className="flex items-center gap-2">
            <Maximize2 className="h-4 w-4" />
            Detailed
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
