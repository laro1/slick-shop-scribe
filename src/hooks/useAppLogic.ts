
import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useInventory } from './useInventory';
import { useSupabaseUsers } from './useSupabaseUsers';
import { useAdmin } from './useAdmin';
import type { User } from '@/types/user';
import { toast } from 'sonner';

export const useAppLogic = () => {
  const { t } = useTranslation();
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [colorTheme, setColorTheme] = useState('blue');

  // Hooks de datos
  const { 
    users, 
    isLoading: isUsersLoading, 
    createUser: createUserMutation,
    updateUser: updateUserMutation,
    deleteUser: deleteUserMutation,
    toggleUserStatus: toggleUserStatusMutation,
  } = useSupabaseUsers();

  const { adminPin, isLoading: isAdminPinLoading } = useAdmin();
  
  const {
    articles,
    sales,
    isLoading: isInventoryLoading,
    addArticle,
    updateArticle,
    deleteArticle,
    addSale,
    updateSale,
    deleteSale,
    refreshData,
  } = useInventory();

  // Estados para configuraciones del admin
  const [productCategories, setProductCategories] = useState<string[]>([]);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [enableLotAndExpiry, setEnableLotAndExpiry] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(30);

  // Efectos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Funciones de autenticación
  const handleLogin = useCallback((user: User, pin: string): boolean => {
    console.log('Attempting login for user:', user.businessName, 'with PIN:', pin);
    if (user.pin === pin) {
      console.log('Login successful for user:', user.businessName);
      setActiveUser(user);
      toast.success(t('welcome_back', { name: user.name }));
      return true;
    }
    console.log('Login failed for user:', user.businessName);
    toast.error(t('incorrect_pin'));
    return false;
  }, [t]);

  const handleCreateUser = useCallback(async (userData: Omit<User, 'id' | 'role' | 'isActive'>) => {
    try {
      console.log('Creating new user:', userData);
      await createUserMutation(userData);
      toast.success(t('business_created_successfully'));
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(t('error_creating_business'));
    }
  }, [createUserMutation, t]);

  const handleAdminLogin = useCallback((pin: string): boolean => {
    console.log('Attempting admin login with PIN:', pin);
    if (adminPin && adminPin === pin) {
      console.log('Admin login successful');
      setIsAdmin(true);
      toast.success(t('welcome_admin'));
      return true;
    }
    console.log('Admin login failed');
    toast.error(t('incorrect_admin_pin'));
    return false;
  }, [adminPin, t]);

  const handleLogout = useCallback(() => {
    console.log('User logging out:', activeUser?.businessName);
    setActiveUser(null);
    toast.success(t('logged_out_successfully'));
  }, [activeUser, t]);

  const handleAdminLogout = useCallback(() => {
    console.log('Admin logging out');
    setIsAdmin(false);
    toast.success(t('admin_logged_out'));
  }, [t]);

  // Funciones de gestión de usuarios
  const handleUpdateUser = useCallback(async (userData: User) => {
    try {
      console.log('Updating user:', userData);
      await updateUserMutation(userData);
      if (activeUser && activeUser.id === userData.id) {
        setActiveUser(userData);
      }
      toast.success(t('user_updated_successfully'));
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(t('error_updating_user'));
    }
  }, [updateUserMutation, activeUser, t]);

  const handleEditUser = useCallback(async (userData: User) => {
    try {
      console.log('Editing user:', userData);
      await updateUserMutation(userData);
      toast.success(t('user_edited_successfully'));
    } catch (error) {
      console.error('Error editing user:', error);
      toast.error(t('error_editing_user'));
    }
  }, [updateUserMutation, t]);

  const handleDeleteUser = useCallback(async (userId: string) => {
    try {
      console.log('Deleting user:', userId);
      await deleteUserMutation(userId);
      toast.success(t('user_deleted_successfully'));
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(t('error_deleting_user'));
    }
  }, [deleteUserMutation, t]);

  const handleToggleUserStatus = useCallback(async (userId: string, isActive: boolean) => {
    try {
      console.log('Toggling user status:', userId, isActive);
      await toggleUserStatusMutation({ userId, isActive });
      toast.success(t('user_status_updated'));
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error(t('error_updating_user_status'));
    }
  }, [toggleUserStatusMutation, t]);

  // Funciones de configuración
  const handleAddCategory = useCallback((category: string) => {
    setProductCategories(prev => [...prev, category]);
    toast.success(t('category_added'));
  }, [t]);

  const handleDeleteCategory = useCallback((category: string) => {
    setProductCategories(prev => prev.filter(c => c !== category));
    toast.success(t('category_deleted'));
  }, [t]);

  const handleSetLowStockThreshold = useCallback((threshold: number) => {
    setLowStockThreshold(threshold);
    toast.success(t('threshold_updated'));
  }, [t]);

  const handleSetEnableLotAndExpiry = useCallback((enabled: boolean) => {
    setEnableLotAndExpiry(enabled);
    toast.success(t('lot_expiry_setting_updated'));
  }, [t]);

  const handleSetSessionTimeout = useCallback((timeout: number) => {
    setSessionTimeout(timeout);
    toast.success(t('session_timeout_updated'));
  }, [t]);

  const handleSetDarkMode = useCallback((dark: boolean) => {
    setDarkMode(dark);
  }, []);

  const handleSetColorTheme = useCallback((theme: string) => {
    setColorTheme(theme);
  }, []);

  // Actions del inventario
  const inventoryActions = {
    addArticle,
    updateArticle,
    deleteArticle,
    addSale,
    updateSale,
    deleteSale,
    refreshData,
  };

  return {
    // Estados
    activeUser,
    isAdmin,
    showSplash,
    isInventoryLoading,
    isUsersLoading,
    isAdminPinLoading,
    darkMode,
    colorTheme,
    
    // Datos
    users,
    articles,
    sales,
    productCategories,
    lowStockThreshold,
    enableLotAndExpiry,
    sessionTimeout,
    
    // Funciones
    t,
    handleLogin,
    handleCreateUser,
    handleAdminLogin,
    handleLogout,
    handleAdminLogout,
    handleUpdateUser,
    handleEditUser,
    handleDeleteUser,
    handleToggleUserStatus,
    handleAddCategory,
    handleDeleteCategory,
    handleSetLowStockThreshold,
    handleSetEnableLotAndExpiry,
    handleSetSessionTimeout,
    handleSetDarkMode,
    handleSetColorTheme,
    inventoryActions,
  };
};
