
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { User } from '@/App';

const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  businessName: z.string().min(2, { message: "El nombre del negocio debe tener al menos 2 caracteres." }),
  pin: z.string().length(4, { message: "El PIN debe tener exactamente 4 dígitos." }).regex(/^\d+$/, "El PIN solo debe contener números."),
  logoUrl: z.string().url({ message: "Por favor, introduce una URL válida." }).optional().or(z.literal('')),
});

interface CreateUserDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCreateUser: (user: Omit<User, 'id'>) => void;
}

export const CreateUserDialog: React.FC<CreateUserDialogProps> = ({ isOpen, onOpenChange, onCreateUser }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      businessName: '',
      pin: '',
      logoUrl: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onCreateUser(values);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Negocio</DialogTitle>
          <DialogDescription>
            Completa los datos para registrar un nuevo negocio en el sistema.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Usuario</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Negocio</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Mi Tiendita" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PIN de 4 dígitos</FormLabel>
                  <FormControl>
                    <Input type="password" maxLength={4} placeholder="••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL del Logo (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://ejemplo.com/logo.png" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Crear Negocio</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
