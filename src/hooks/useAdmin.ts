
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const fetchAdminPin = async (): Promise<string | null> => {
  try {
    console.log('Fetching admin pin from Supabase...');
    console.log('Supabase URL: https://lfcanknjipqulsbgjmmg.supabase.co');
    console.log('Checking RLS policies for admin_config table...');
    
    // Verificar la configuración de admin directamente usando SELECT público
    const { data, error } = await supabase
      .from('admin_config')
      .select('pin')
      .eq('id', 1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('No admin config found, trying to create default...');
        // Intentar crear configuración por defecto
        const { data: newData, error: insertError } = await supabase
          .from('admin_config')
          .insert({ id: 1, pin: '0000' })
          .select('pin')
          .single();
        
        if (insertError) {
          console.error('Error creating default admin config:', insertError);
          toast.error('No se pudo crear la configuración de administrador.');
          return null;
        }
        
        console.log('Default admin config created successfully');
        return newData?.pin ?? null;
      }
      
      console.error('Error fetching admin pin:', error);
      console.error('Error details:', error.details, error.hint, error.message);
      
      if (error.code === 'PGRST301') {
        toast.error('Sin permisos para acceder a la configuración de administrador.');
      } else {
        toast.error(`Error de base de datos: ${error.message}`);
      }
      return null;
    }
    
    console.log('Admin pin fetched successfully');
    return data?.pin ?? null;
  } catch (error) {
    console.error('Unexpected error in fetchAdminPin:', error);
    toast.error('Error inesperado al cargar la configuración.');
    return null;
  }
};

export const useAdmin = () => {
  const { data: adminPin, isLoading: isAdminPinLoading, error } = useQuery({
    queryKey: ['admin_config'],
    queryFn: fetchAdminPin,
    retry: (failureCount, error: any) => {
      // No reintentar si es un error de permisos RLS
      if (error?.code === 'PGRST301') {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  if (error) {
    console.error('Admin query error:', error);
  }

  return { adminPin, isAdminPinLoading };
};
