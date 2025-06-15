
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

interface DeleteUserDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  user: User;
  onDelete: (userId: string, pin: string) => boolean;
}

export const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({ isOpen, onOpenChange, user, onDelete }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError("El PIN debe tener 4 dígitos.");
      return;
    }
    const success = onDelete(user.id, pin);
    if (success) {
      onOpenChange(false);
      setPin('');
      setError('');
    } else {
       // The error toast is shown in App.tsx, but we can set a local error message too
       setError('PIN incorrecto. No se pudo eliminar el negocio.');
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
          <DialogTitle>Eliminar {user.businessName}</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. Para confirmar, introduce el PIN de 4 dígitos de este negocio.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <Input
              id="pin"
              type="password"
              value={pin}
              onChange={(e) => {
                setError('');
                setPin(e.target.value);
              }}
              maxLength={4}
              placeholder="••••"
              className="text-center text-2xl tracking-[.5em]"
              autoFocus
            />
            {error && <p className="text-sm font-medium text-destructive text-center">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>Cancelar</Button>
            <Button type="submit" variant="destructive">Eliminar Permanentemente</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
