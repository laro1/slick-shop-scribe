import { useState, useEffect } from 'react';
import type { User } from '@/types/user';
import { toast } from 'sonner';

const USERS_KEY = 'inventory_users';

// Funciones auxiliares para localStorage
const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Función para generar IDs únicos
const generateId = (): string => {
  return crypto.randomUUID();
};

export const useLocalUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos del localStorage al inicializar
  useEffect(() => {
    const loadedUsers = loadFromStorage<User[]>(USERS_KEY, []);
    setUsers(loadedUsers);
    setIsLoading(false);
  }, []);

  // Función para refrescar datos (mantener compatibilidad)
  const refetch = async () => {
    console.log('Refreshing users from localStorage...');
    // En localStorage no necesitamos refrescar, pero mantenemos la función por compatibilidad
  };

  // CREAR usuario
  const createUser = async (userData: Omit<User, 'id' | 'role' | 'isActive'>): Promise<any> => {
    try {
      console.log('Creating user in localStorage:', userData);
      
      const newUser: User = {
        id: generateId(),
        name: userData.name,
        businessName: userData.businessName,
        pin: userData.pin,
        logoUrl: userData.logoUrl,
        role: 'Vendedor', // Rol por defecto
        isActive: true,
        currency: userData.currency,
        language: userData.language,
      };

      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      saveToStorage(USERS_KEY, updatedUsers);
      
      toast.success('Usuario creado exitosamente');
      console.log('User created successfully:', newUser);
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Error al crear usuario');
      throw error;
    }
  };

  // ACTUALIZAR usuario
  const updateUser = async (userData: User): Promise<any> => {
    try {
      console.log('Updating user in localStorage:', userData);
      
      const updatedUsers = users.map(user => 
        user.id === userData.id ? userData : user
      );
      
      setUsers(updatedUsers);
      saveToStorage(USERS_KEY, updatedUsers);
      
      toast.success('Usuario actualizado correctamente');
      console.log('User updated successfully');
      return userData;
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Error al actualizar usuario');
      throw error;
    }
  };

  // ELIMINAR usuario
  const deleteUser = async (userId: string): Promise<any> => {
    try {
      console.log('Deleting user from localStorage:', userId);
      
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      saveToStorage(USERS_KEY, updatedUsers);
      
      toast.success('Usuario eliminado correctamente');
      console.log('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error al eliminar usuario');
      throw error;
    }
  };

  // CAMBIAR estado activo/inactivo
  const toggleUserStatus = async ({ userId, isActive }: { userId: string; isActive: boolean }): Promise<any> => {
    try {
      console.log('Toggling user status in localStorage:', userId, isActive);
      
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, isActive } : user
      );
      
      setUsers(updatedUsers);
      saveToStorage(USERS_KEY, updatedUsers);
      
      toast.success('Estado del usuario actualizado');
      console.log('User status toggled successfully');
      
      return updatedUsers.find(user => user.id === userId);
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Error al cambiar estado del usuario');
      throw error;
    }
  };

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