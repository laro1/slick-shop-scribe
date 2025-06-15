import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardDescription, CardTitle } from '@/components/ui/card';
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
import type { User } from '@/types/user';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslation } from 'react-i18next';
import { Switch } from '@/components/ui/switch';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

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
  darkMode: boolean;
  onSetDarkMode: (enabled: boolean) => void;
  colorTheme: string;
  onSetColorTheme: (theme: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ 
  currentUser, 
  onUpdateUser,
  darkMode,
  onSetDarkMode,
  colorTheme,
  onSetColorTheme,
}) => {
  const { t } = useTranslation();
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
        <Accordion type="multiple" className="w-full space-y-4" defaultValue={['general-settings']}>
          <AccordionItem value="general-settings" className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <AccordionTrigger className="p-6 hover:no-underline">
              <div className="text-left">
                <CardTitle>{t('general_settings')}</CardTitle>
                <CardDescription className="mt-1.5">
                  {t('update_business_data')}
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
                        <FormLabel>{t('user_name')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('user_name_placeholder')} {...field} />
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
                        <FormLabel>{t('business_name')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('business_name_placeholder')} {...field} />
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
                        <FormLabel>{t('logo_url')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('logo_url_placeholder')} {...field} />
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
                        <FormLabel>{t('default_currency')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('select_currency')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="COP">{t('currency_cop')}</SelectItem>
                            <SelectItem value="USD">{t('currency_usd')}</SelectItem>
                            <SelectItem value="EUR">{t('currency_eur')}</SelectItem>
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
                        <FormLabel>{t('system_language')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('select_language')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="es">{t('language_es')}</SelectItem>
                            <SelectItem value="en">{t('language_en')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end pt-4">
                    <Button type="submit">{t('save_changes')}</Button>
                  </div>
                </form>
              </Form>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="appearance-settings" className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <AccordionTrigger className="p-6 hover:no-underline">
              <div className="text-left">
                <CardTitle>Apariencia</CardTitle>
                <CardDescription className="mt-1.5">
                  Personaliza el aspecto de la aplicación.
                </CardDescription>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 px-6 pb-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Modo Oscuro</FormLabel>
                  <CardDescription>Activa el modo oscuro para una experiencia visual más cómoda en condiciones de poca luz.</CardDescription>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={onSetDarkMode}
                  aria-label="Toggle dark mode"
                />
              </div>
              
              <ThemeSwitcher 
                variant="inline"
                colorTheme={colorTheme}
                onSetColorTheme={onSetColorTheme}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};
