import { useState, useEffect } from "react";
import { useInventory } from "@/hooks/useInventory";
import { useUsers } from "@/hooks/useUsers";
import { useAdmin } from "@/hooks/useAdmin";
import type { ArticleFormData, SaleFormData, EditArticleData, EditSaleData } from "@/types/inventory";
import type { User, UserFormData } from "@/types/user";
import { useTranslation } from "react-i18next";
import { toast } from "@/components/ui/sonner";

export const useAppLogic = () => {
  const { users, isUsersLoading, addUser, updateUser, deleteUser, toggleUserStatus } = useUsers();
  const { adminPin, isAdminPinLoading } = useAdmin();
  const { t, i18n } = useTranslation();
  
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const [productCategories, setProductCategories] = useState<string[]>(() => {
    const savedCategories = localStorage.getItem("inventory_product_categories");
    if (savedCategories) {
      return JSON.parse(savedCategories);
    }
    return ['General']; // Default category
  });

  const [lowStockThreshold, setLowStockThreshold] = useState<number>(() => {
    const savedThreshold = localStorage.getItem("inventory_low_stock_threshold");
    if (savedThreshold) {
      return JSON.parse(savedThreshold);
    }
    return 5; // Default threshold
  });

  const [enableLotAndExpiry, setEnableLotAndExpiry] = useState<boolean>(() => {
    const saved = localStorage.getItem("inventory_lot_expiry_enabled");
    return saved ? JSON.parse(saved) : false;
  });

  const [sessionTimeout, setSessionTimeout] = useState<number>(() => {
    const saved = localStorage.getItem("inventory_session_timeout");
    return saved ? JSON.parse(saved) : 30; // Default 30 minutes
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("app-dark-mode");
    if (saved !== null) return JSON.parse(saved);
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [colorTheme, setColorTheme] = useState<string>(() => {
    return localStorage.getItem("app-color-theme") || 'default';
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (activeUser?.language && i18n.language !== activeUser.language) {
      i18n.changeLanguage(activeUser.language);
    }
  }, [activeUser, i18n]);

  useEffect(() => {
    localStorage.setItem("inventory_product_categories", JSON.stringify(productCategories));
  }, [productCategories]);

  useEffect(() => {
    localStorage.setItem("inventory_low_stock_threshold", JSON.stringify(lowStockThreshold));
  }, [lowStockThreshold]);

  useEffect(() => {
    localStorage.setItem("inventory_lot_expiry_enabled", JSON.stringify(enableLotAndExpiry));
  }, [enableLotAndExpiry]);

  useEffect(() => {
    localStorage.setItem("inventory_session_timeout", JSON.stringify(sessionTimeout));
  }, [sessionTimeout]);

  useEffect(() => {
    const root = document.documentElement;
    
    // color theme
    const themes = ['theme-red', 'theme-mint', 'theme-gray'];
    root.classList.remove(...themes);
    if (colorTheme !== 'default') {
      root.classList.add(`theme-${colorTheme}`);
    }
    localStorage.setItem("app-color-theme", colorTheme);

    // dark mode
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem("app-dark-mode", JSON.stringify(darkMode));
  }, [darkMode, colorTheme]);

  const handleLogin = (user: User, pin: string) => {
    if (!user.isActive) {
      toast.error(t('account_deactivated'));
      return false;
    }
    if (user.pin === pin) {
      setActiveUser(user);
      toast.success(t('welcome_message', { name: user.name }));
      return true;
    }
    toast.error(t('incorrect_pin'));
    return false;
  };

  const handleLogout = () => {
    setActiveUser(null);
  };

  const handleCreateUser = (newUser: UserFormData) => {
    addUser(newUser);
  };
  
  const handleDeleteUser = (userId: string, pin: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) {
      toast.error(t('user_not_found'));
      return false;
    }

    if (userToDelete.pin !== pin) {
      toast.error(t('incorrect_pin'));
      return false;
    }

    deleteUser(userId);
    toast.success(t('business_deleted', { businessName: userToDelete.businessName }));
    return true;
  };

  const handleUpdateUser = async (userId: string, updatedData: Partial<Omit<User, 'id' | 'pin'>>) => {
    await updateUser({ userId, data: updatedData });
    setActiveUser(prevActiveUser => {
      if (prevActiveUser && prevActiveUser.id === userId) {
        return { ...prevActiveUser, ...updatedData };
      }
      return prevActiveUser;
    });
  };

  const handleEditUser = async (userId: string, pin: string, updatedData: Partial<Omit<User, 'id' | 'pin'>>) => {
    const userToEdit = users.find(u => u.id === userId);
    if (!userToEdit) {
      toast.error(t('user_not_found'));
      return false;
    }

    if (userToEdit.pin !== pin) {
      toast.error(t('incorrect_pin'));
      return false;
    }
    
    try {
        await updateUser({ userId, data: updatedData });
        return true;
    } catch (e) {
        return false;
    }
  };

  const handleToggleUserStatus = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      toggleUserStatus({ userId, currentStatus: user.isActive, userName: user.name });
    }
  };

  const handleAdminLogin = (pin: string) => {
    if (isAdminPinLoading) {
      toast.info(t('verifying_pin'));
      return false;
    }
    if (!adminPin) {
      toast.error(t('admin_config_unavailable'));
      return false;
    }
    if (pin === adminPin) {
      setIsAdmin(true);
      toast.success(t('admin_access_granted'));
      return true;
    }
    toast.error(t('admin_pin_incorrect'));
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
  };

  const handleAddCategory = (category: string) => {
    if (productCategories.map(c => c.toLowerCase()).includes(category.toLowerCase())) {
      toast.error(t('category_exists'));
      return;
    }
    setProductCategories(prev => [...prev, category]);
    toast.success(t('category_added', { category }));
  };

  const handleDeleteCategory = (category: string) => {
    setProductCategories(prev => prev.filter(c => c !== category));
    toast.success(t('category_deleted', { category }));
  };

  const handleSetLowStockThreshold = (threshold: number) => {
    if (threshold >= 0) {
      setLowStockThreshold(threshold);
      toast.success(t('low_stock_threshold_set', { threshold }));
    } else {
      toast.error(t('invalid_threshold'));
    }
  };

  const handleSetEnableLotAndExpiry = (enabled: boolean) => {
    setEnableLotAndExpiry(enabled);
    toast.success(t('lot_expiry_tracking', { enabled: enabled ? t('enabled') : t('disabled') }));
  };

  const handleSetSessionTimeout = (minutes: number) => {
    if (minutes > 0) {
      setSessionTimeout(minutes);
      toast.success(t('session_timeout_set', { minutes }));
    } else {
      toast.error(t('invalid_session_timeout'));
    }
  };

  const handleSetDarkMode = (enabled: boolean) => {
    setDarkMode(enabled);
    toast.success("Modo oscuro actualizado");
  };

  const handleSetColorTheme = (theme: string) => {
    setColorTheme(theme);
    toast.success("Tema de color actualizado");
  };

  const { articles, sales, addArticle, updateArticle, deleteArticle, addSale, updateSale, deleteSale, isLoading: isInventoryLoading } = useInventory();

  const inventoryActions = {
    addArticle: async (articleData: ArticleFormData) => {
      try {
        await addArticle(articleData);
        toast.success(t('article_registered'));
      } catch (e) {
        toast.error((e as Error).message);
      }
    },
    updateArticle: async (updatedArticle: EditArticleData) => {
      try {
        await updateArticle(updatedArticle);
        toast.success(t('article_updated'));
      } catch (e) {
        toast.error((e as Error).message);
      }
    },
    deleteArticle: async (articleId: string) => {
      try {
        await deleteArticle(articleId);
        toast.success(t('article_deleted'));
      } catch (e) {
        toast.error((e as Error).message);
      }
    },
    addSale: async (saleData: SaleFormData) => {
      try {
        await addSale(saleData);
        toast.success(t('sale_registered'));
      } catch (e) {
        toast.error((e as Error).message);
      }
    },
    updateSale: async (updatedSale: EditSaleData) => {
      try {
        await updateSale(updatedSale);
        toast.success(t('sale_updated'));
      } catch (e) {
        toast.error((e as Error).message);
      }
    },
    deleteSale: async (saleId: string) => {
      try {
        await deleteSale(saleId);
        toast.success(t('sale_deleted'));
      } catch (e) {
        toast.error((e as Error).message);
      }
    },
  };

  return {
    users,
    isUsersLoading,
    isAdminPinLoading,
    t,
    activeUser,
    isAdmin,
    showSplash,
    productCategories,
    lowStockThreshold,
    enableLotAndExpiry,
    sessionTimeout,
    handleLogin,
    handleLogout,
    handleCreateUser,
    handleDeleteUser,
    handleUpdateUser,
    handleEditUser,
    handleToggleUserStatus,
    handleAdminLogin,
    handleAdminLogout,
    handleAddCategory,
    handleDeleteCategory,
    handleSetLowStockThreshold,
    handleSetEnableLotAndExpiry,
    handleSetSessionTimeout,
    handleSetDarkMode,
    handleSetColorTheme,
    articles,
    sales,
    isInventoryLoading,
    inventoryActions,
    darkMode,
    colorTheme,
  };
};
