import React, { useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { User, UserRole } from '@/App';

const ROLES: UserRole[] = ['Administrador', 'Vendedor', 'Inventarista', 'Consultor'];

const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  businessName: z.string().min(2, { message: "El nombre del negocio debe tener al menos 2 caracteres." }),
  logoUrl: z.string().url({ message: "Por favor, introduce una URL válida." }).optional().or(z.literal('')),
  pin: z.string().length(4, { message: "El PIN debe tener exactamente 4 dígitos." }).regex(/^\d+$/, "El PIN solo debe contener números."),
  role: z.enum(ROLES),
});

type FormValues = z.infer<typeof formSchema>;

interface EditUserDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  user: User;
  onEditUser: (userId: string, pin: string, data: Partial<Omit<User, 'id' | 'pin'>>) => boolean;
}

export const EditUserDialog: React.FC<EditUserDialogProps> = ({ isOpen, onOpenChange, user, onEditUser }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      businessName: '',
      logoUrl: '',
      pin: '',
      role: 'Vendedor',
    },
  });

  useEffect(() => {
    if (user && isOpen) {
      form.reset({
        name: user.name,
        businessName: user.businessName,
        logoUrl: user.logoUrl || '',
        pin: '',
        role: user.role,
      });
    }
  }, [user, isOpen, form]);

  const onSubmit = (values: FormValues) => {
    const success = onEditUser(user.id, values.pin, {
      name: values.name,
      businessName: values.businessName,
      logoUrl: values.logoUrl || undefined,
      role: values.role,
    });
    
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar {user.businessName}</DialogTitle>
          <DialogDescription>
            Actualiza los datos del negocio. Se requiere el PIN para guardar los cambios.
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
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol del Usuario</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ROLES.map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="pin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PIN de confirmación</FormLabel>
                  <FormControl>
                    <Input type="password" maxLength={4} placeholder="••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
