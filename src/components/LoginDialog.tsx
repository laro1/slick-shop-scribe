
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { User } from '@/types/user';
import { toast } from 'sonner';

interface LoginDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  user: User;
  onLogin: (user: User, pin: string) => boolean;
}

export const LoginDialog: React.FC<LoginDialogProps> = ({ isOpen, onOpenChange, user, onLogin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError("El PIN debe tener 4 dígitos.");
      return;
    }
    const success = onLogin(user, pin);
    if (success) {
      onOpenChange(false);
      setPin('');
      setError('');
    } else {
       setError('PIN incorrecto. Inténtalo de nuevo.');
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    if(!open) {
      setPin('');
      setError('');
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Iniciar Sesión en {user.businessName}</DialogTitle>
          <DialogDescription>
            Introduce tu PIN de 4 dígitos para acceder.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <Input
              id="pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={4}
              placeholder="••••"
              className="text-center text-2xl tracking-[.5em]"
              autoFocus
            />
            {error && <p className="text-sm font-medium text-destructive text-center">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit">Entrar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
