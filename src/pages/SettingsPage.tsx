import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { User } from '@/App';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  businessName: z.string().min(2, { message: "El nombre del negocio debe tener al menos 2 caracteres." }),
  logoUrl: z.string().url({ message: "Por favor, introduce una URL válida." }).optional().or(z.literal('')),
  currency: z.string().optional(),
  language: z.string().optional(),
});

interface SettingsPageProps {
  currentUser: User;
  onUpdateUser: (userId: string, updatedData: Partial<Omit<User, 'id' | 'pin'>>) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ currentUser, onUpdateUser }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: currentUser.name,
      businessName: currentUser.businessName,
      logoUrl: currentUser.logoUrl || '',
      currency: currentUser.currency || 'COP',
      language: currentUser.language || 'es',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onUpdateUser(currentUser.id, {
      name: values.name,
      businessName: values.businessName,
      logoUrl: values.logoUrl || undefined,
      currency: values.currency,
      language: values.language,
    });
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl">
        <Accordion type="single" collapsible className="w-full space-y-4" defaultValue="general-settings">
          <AccordionItem value="general-settings" className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <AccordionTrigger className="p-6 hover:no-underline">
              <div className="text-left">
                <CardTitle>Configuración General</CardTitle>
                <CardDescription className="mt-1.5">
                  Actualiza los datos generales de tu negocio. El PIN no se puede cambiar desde aquí.
                </CardDescription>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
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
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Moneda Predeterminada</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una moneda" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="COP">COP - Peso Colombiano</SelectItem>
                            <SelectItem value="USD">USD - Dólar Americano</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Idioma del Sistema</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un idioma" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="en">Inglés</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end pt-4">
                    <Button type="submit">Guardar Cambios</Button>
                  </div>
                </form>
              </Form>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};
