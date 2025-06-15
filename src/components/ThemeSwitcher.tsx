
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Settings, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { CardDescription } from '@/components/ui/card';

interface ThemeSwitcherProps {
  colorTheme: string;
  onSetColorTheme: (theme: string) => void;
  darkMode: boolean;
  onSetDarkMode: (enabled: boolean) => void;
  className?: string;
  variant?: 'popover' | 'inline';
}

const themes = [
    { name: 'default', label: 'Predeterminado', color: 'hsl(211 100% 50%)' },
    { name: 'red', label: 'Rojo', color: 'hsl(0 65% 55%)' },
    { name: 'mint', label: 'Menta', color: 'hsl(160 40% 55%)' },
    { name: 'gray', label: 'Gris', color: 'hsl(210 10% 50%)' },
];

const ThemePicker = ({ colorTheme, onSetColorTheme, darkMode, onSetDarkMode }: { 
  colorTheme: string; 
  onSetColorTheme: (theme: string) => void; 
  darkMode: boolean;
  onSetDarkMode: (enabled: boolean) => void;
}) => (
    <div className="space-y-4">
    <div>
        <Label className="text-sm font-medium text-foreground/80">Color</Label>
        <div className="flex items-center gap-3 mt-2">
            {themes.map((theme) => (
            <button
                key={theme.name}
                type="button"
                onClick={() => onSetColorTheme(theme.name)}
                className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all",
                colorTheme === theme.name ? "border-primary" : "border-transparent"
                )}
                style={{ backgroundColor: theme.color }}
                aria-label={theme.label}
            >
                {colorTheme === theme.name && (
                <div className="h-4 w-4 rounded-full bg-primary-foreground" />
                )}
            </button>
            ))}
        </div>
    </div>
    <div>
        <Label className="text-sm font-medium text-foreground/80">Modo</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
            <Button variant={!darkMode ? 'secondary' : 'outline'} size="sm" onClick={() => onSetDarkMode(false)} className="justify-start gap-2 h-9">
                <Sun className="h-4 w-4" />
                Claro
            </Button>
            <Button variant={darkMode ? 'secondary' : 'outline'} size="sm" onClick={() => onSetDarkMode(true)} className="justify-start gap-2 h-9">
                <Moon className="h-4 w-4" />
                Oscuro
            </Button>
        </div>
    </div>
  </div>
);

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ colorTheme, onSetColorTheme, darkMode, onSetDarkMode, className, variant = 'popover' }) => {
  if (variant === 'inline') {
    return (
      <div className={cn("space-y-3", className)}>
         <Label className="text-base">Apariencia</Label>
         <CardDescription>Personaliza el aspecto de la aplicación.</CardDescription>
         <div className="rounded-lg border p-4">
            <ThemePicker colorTheme={colorTheme} onSetColorTheme={onSetColorTheme} darkMode={darkMode} onSetDarkMode={onSetDarkMode} />
         </div>
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className={className}>
          <Settings className="h-5 w-5" />
          <span className="sr-only">Cambiar tema</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-4 space-y-3">
        <div className="space-y-1.5">
          <Label>Apariencia</Label>
          <CardDescription className="text-xs">Personaliza la apariencia de la app.</CardDescription>
        </div>
        <ThemePicker colorTheme={colorTheme} onSetColorTheme={onSetColorTheme} darkMode={darkMode} onSetDarkMode={onSetDarkMode} />
      </PopoverContent>
    </Popover>
  );
};
