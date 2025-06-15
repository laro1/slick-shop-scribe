
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const fetchAdminPin = async (): Promise<string | null> => {
  const { data, error } = await supabase
    .from('admin_config')
    .select('pin')
    .eq('id', 1)
    .single();

  if (error) {
    toast.error('No se pudo cargar la configuración de administrador.');
    console.error('Error fetching admin pin:', error);
    return null;
  }
  
  return data?.pin ?? null;
};

export const useAdmin = () => {
  const { data: adminPin, isLoading: isAdminPinLoading } = useQuery({
    queryKey: ['admin_config'],
    queryFn: fetchAdminPin,
  });

  return { adminPin, isAdminPinLoading };
};
