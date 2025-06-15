
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { User, UserFormData } from '@/types/user';
import { toast } from 'sonner';

const fetchUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase.from('users').select('*').order('created_at');
  if (error) throw new Error(error.message);
  return data as User[];
};

export const useUsers = () => {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading: isUsersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const addUserMutation = useMutation({
    mutationFn: async (newUser: UserFormData) => {
      const { data: existing } = await supabase.from('users').select('id').eq('businessName', newUser.businessName).single();
      if (existing) {
        throw new Error('Ya existe un negocio con ese nombre.');
      }
      const { error } = await supabase.from('users').insert(newUser as any);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario creado con éxito!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string, data: Partial<Omit<User, 'id' | 'pin'>> }) => {
      const { error } = await supabase.from('users').update(data as any).eq('id', userId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Los datos del negocio se han actualizado correctamente.');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ userId, currentStatus, userName }: { userId: string, currentStatus: boolean, userName: string }) => {
      const { error } = await supabase.from('users').update({ isActive: !currentStatus }).eq('id', userId);
      if (error) throw new Error(error.message);
      return { newStatus: !currentStatus, userName };
    },
    onSuccess: ({ newStatus, userName }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`La cuenta de ${userName} ha sido ${newStatus ? 'activada' : 'desactivada'}.`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    users,
    isUsersLoading,
    addUser: addUserMutation.mutate,
    updateUser: updateUserMutation.mutateAsync,
    deleteUser: deleteUserMutation.mutate,
    toggleUserStatus: toggleUserStatusMutation.mutate,
  };
};
