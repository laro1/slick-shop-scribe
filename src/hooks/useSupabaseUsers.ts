
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@/types/user';
import { toast } from 'sonner';

// Interfaz para mapear los datos de Supabase
interface SupabaseUserRow {
  id: string;
  name: string;
  business_name: string;
  pin: string;
  logo_url: string | null;
  role: 'Administrador' | 'Vendedor' | 'Inventarista' | 'Consultor';
  is_active: boolean;
  currency: string | null;
  language: string | null;
  created_at: string;
}

export const useSupabaseUsers = () => {
  const queryClient = useQueryClient();

  // Obtener todos los usuarios
  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<User[]> => {
      console.log('Fetching users from Supabase...');
      console.log('Supabase URL:', supabase.supabaseUrl);
      
      try {
        // Primero verificar la conexión con una consulta simple
        const { data: connectionTest, error: connectionError } = await supabase
          .from('users')
          .select('count', { count: 'exact', head: true });
        
        if (connectionError) {
          console.error('Connection test failed:', connectionError);
          throw new Error(`Error de conexión: ${connectionError.message}`);
        }
        
        console.log('Connection test successful, total users:', connectionTest);
        
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching users:', error);
          toast.error(`Error al obtener usuarios: ${error.message}`);
          throw new Error(`Error al obtener usuarios: ${error.message}`);
        }
        
        console.log('Raw users data from Supabase:', data);
        
        if (!data) {
          console.log('No users data returned');
          return [];
        }
        
        const mappedUsers = data.map((user: SupabaseUserRow) => ({
          id: user.id,
          name: user.name,
          businessName: user.business_name,
          pin: user.pin,
          logoUrl: user.logo_url || undefined,
          role: user.role,
          isActive: user.is_active,
          currency: user.currency || undefined,
          language: user.language || undefined,
        } as User));
        
        console.log('Users mapped successfully:', mappedUsers.length, 'users');
        return mappedUsers;
      } catch (error) {
        console.error('Error in users query:', error);
        toast.error('No se pudo conectar con la base de datos');
        throw error;
      }
    },
    retry: 3,
    retryDelay: 1000,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Crear nuevo usuario
  const { mutateAsync: createUser } = useMutation({
    mutationFn: async (userData: Omit<User, 'id' | 'role' | 'isActive'>) => {
      console.log('Creating user in Supabase:', userData);
      
      const { data, error } = await supabase
        .from('users')
        .insert({
          name: userData.name,
          business_name: userData.businessName,
          pin: userData.pin,
          logo_url: userData.logoUrl || null,
          role: 'Vendedor', // Rol por defecto
          is_active: true,
          currency: userData.currency || null,
          language: userData.language || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        throw new Error(`Error al crear usuario: ${error.message}`);
      }
      
      console.log('User created successfully:', data);
      return data;
    },
    onSuccess: () => {
      console.log('User created, refreshing data...');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      refetch();
    },
    onError: (error) => {
      console.error('Error creating user:', error);
      toast.error('Error al crear usuario');
    }
  });

  // Actualizar usuario
  const { mutateAsync: updateUser } = useMutation({
    mutationFn: async (userData: User) => {
      console.log('Updating user in Supabase:', userData);
      
      const { data, error } = await supabase
        .from('users')
        .update({
          name: userData.name,
          business_name: userData.businessName,
          pin: userData.pin,
          logo_url: userData.logoUrl || null,
          role: userData.role,
          is_active: userData.isActive,
          currency: userData.currency || null,
          language: userData.language || null,
        })
        .eq('id', userData.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating user:', error);
        throw new Error(`Error al actualizar usuario: ${error.message}`);
      }
      
      console.log('User updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      console.log('User updated, refreshing data...');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      refetch();
    },
    onError: (error) => {
      console.error('Error updating user:', error);
      toast.error('Error al actualizar usuario');
    }
  });

  // Eliminar usuario
  const { mutateAsync: deleteUser } = useMutation({
    mutationFn: async (userId: string) => {
      console.log('Deleting user from Supabase:', userId);
      
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) {
        console.error('Error deleting user:', error);
        throw new Error(`Error al eliminar usuario: ${error.message}`);
      }
      
      console.log('User deleted successfully');
    },
    onSuccess: () => {
      console.log('User deleted, refreshing data...');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      refetch();
    },
    onError: (error) => {
      console.error('Error deleting user:', error);
      toast.error('Error al eliminar usuario');
    }
  });

  // Cambiar estado activo/inactivo
  const { mutateAsync: toggleUserStatus } = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      console.log('Toggling user status in Supabase:', userId, isActive);
      
      const { data, error } = await supabase
        .from('users')
        .update({ is_active: isActive })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error toggling user status:', error);
        throw new Error(`Error al cambiar estado del usuario: ${error.message}`);
      }
      
      console.log('User status toggled successfully:', data);
      return data;
    },
    onSuccess: () => {
      console.log('User status toggled, refreshing data...');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      refetch();
    },
    onError: (error) => {
      console.error('Error toggling user status:', error);
      toast.error('Error al cambiar estado del usuario');
    }
  });

  return {
    users,
    isLoading,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    refetch,
  };
};
