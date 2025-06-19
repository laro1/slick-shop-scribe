
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const fetchAdminPin = async (): Promise<string | null> => {
  try {
    console.log('Fetching admin pin from Supabase...');
    console.log('Supabase URL: https://lfcanknjipqulsbgjmmg.supabase.co');
    
    // Primero verificar si la tabla existe
    const { data: tableCheck, error: tableError } = await supabase
      .from('admin_config')
      .select('count', { count: 'exact', head: true });
    
    if (tableError) {
      console.error('Admin config table check failed:', tableError);
      toast.error('No se pudo acceder a la configuración de administrador.');
      return null;
    }
    
    console.log('Admin config table exists, record count:', tableCheck);
    
    const { data, error } = await supabase
      .from('admin_config')
      .select('pin')
      .eq('id', 1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('No admin config found, creating default...');
        // Crear configuración por defecto
        const { data: newData, error: insertError } = await supabase
          .from('admin_config')
          .insert({ id: 1, pin: '0000' })
          .select('pin')
          .single();
        
        if (insertError) {
          console.error('Error creating default admin config:', insertError);
          return null;
        }
        
        console.log('Default admin config created');
        return newData?.pin ?? null;
      }
      
      console.error('Error fetching admin pin:', error);
      toast.error('No se pudo cargar la configuración de administrador.');
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
    retry: 3,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  if (error) {
    console.error('Admin query error:', error);
  }

  return { adminPin, isAdminPinLoading };
};
