
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { CardDescription } from '@/components/ui/card';

interface ThemeSwitcherProps {
  colorTheme: string;
  onSetColorTheme: (theme: string) => void;
  className?: string;
  variant?: 'popover' | 'inline';
}

const themes = [
    { name: 'default', label: 'Predeterminado', color: 'hsl(211 100% 50%)' },
    { name: 'red', label: 'Rojo', color: 'hsl(0 65% 55%)' },
    { name: 'mint', label: 'Menta', color: 'hsl(160 40% 55%)' },
    { name: 'gray', label: 'Gris', color: 'hsl(210 10% 50%)' },
];

const ThemePicker = ({ colorTheme, onSetColorTheme }: { colorTheme: string; onSetColorTheme: (theme: string) => void; }) => (
  <div className="flex items-center gap-3">
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
);

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ colorTheme, onSetColorTheme, className, variant = 'popover' }) => {
  if (variant === 'inline') {
    return (
      <div className={cn("space-y-3", className)}>
         <Label className="text-base">Tema de Color</Label>
         <CardDescription>Elige una paleta de colores para la interfaz.</CardDescription>
         <ThemePicker colorTheme={colorTheme} onSetColorTheme={onSetColorTheme} />
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
      <PopoverContent className="w-auto p-4 space-y-2">
        <Label>Tema de Color</Label>
        <ThemePicker colorTheme={colorTheme} onSetColorTheme={onSetColorTheme} />
      </PopoverContent>
    </Popover>
  );
};
